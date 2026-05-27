import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessEntity } from '../../../../entities/business/business.entity';
import {
  Brackets,
  EntityManager,
  getRepository,
  In,
  Repository,
} from 'typeorm';
import { PageListVo } from '../../../common/page/pageList';
import { StoreHoursEntity } from '../../../../entities/store/store_hours.entity';
import { StoreEntity } from '../../../../entities/store/store.entity';
import { StoreStatusEnum } from '../../../../enum/business_enum';

@Injectable()
export class HoursService {
  constructor(
    @InjectRepository(StoreHoursEntity)
    private readonly businessHoursRepository: Repository<StoreHoursEntity>,

    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any, business_id: number): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = await this.businessHoursRepository
        .createQueryBuilder('hours')
        .innerJoinAndMapOne(
          'hours.business',
          BusinessEntity,
          'business',
          'hours.business_id=business.id',
        )
        .where(
          new Brackets((qb) => {
            if (business_id) {
              qb.andWhere('hours.business_id = :business_id', { business_id });
            }
            //   if (parameter.userName) {
            //     qb.andWhere('hours.username LIKE :userName', {
            //       userName: `%${parameter.userName}%`,
            //     });
            //   }
          }),
        )
        // .orderBy(`business.created_at`, 'DESC')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize);

      const [data, count] = await qb.getManyAndCount();

      return {
        ...{ content: data },
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      Logger.error(`查询分页列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '查询分页列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 修改营业时间
   * @param requestData
   */
  async updateShopServingTime(data: any): Promise<any> {
    try {
      const store = await this.storeRepository.findOne({
        where: { id: data.storeId },
      });
      if (!store) {
        throw new Error('Store not found');
      }
      // 删除当前门店的所有营业时间
      await this.businessHoursRepository.delete({ storeId: store.id });

      // 新增新的营业时间
      const timeSlots = data.normalServingTimeList.flatMap((timeSlot) => {
        return timeSlot.weeks.map((dayOfWeek) => {
          return timeSlot.buinessHours.map((businessHour) => {
            // ✅ 修正：返回完整对象
            return {
              storeId: store.id,
              dayOfWeek: dayOfWeek,
              startTime: businessHour.startTime,
              endTime: businessHour.endTime,
            };
          });
        });
      });
      const flattenedTimeSlots = timeSlots.flat(2);
      await this.businessHoursRepository.save(flattenedTimeSlots);
    } catch (error) {
      Logger.error('营业时间修改失败，原因：' + error);
    }
  }

  // 查询门店营业时间
  async queryShopServingTime(data: any): Promise<any> {
    try {
      const storeHours = await this.businessHoursRepository.find({
        where: { storeId: data.storeId },
      });

      let weeks = {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
      };
      const flexibleServingTimeStrList = storeHours.map((hour) => {
        const weekName = weeks[hour.dayOfWeek];
        return `${weekName} ${hour.startTime}-${hour.endTime}`;
      });

      // 构建 normalServingTimeList（如果需要）
      const groupedByTime = storeHours.reduce((acc, hour) => {
        const timeKey = `${hour.startTime}-${hour.endTime}`;
        if (!acc[timeKey]) {
          acc[timeKey] = {
            weeks: [],
            buinessHours: [
              {
                startTime: hour.startTime,
                endTime: hour.endTime,
              },
            ],
          };
        }
        acc[timeKey].weeks.push(hour.dayOfWeek);
        return acc;
      }, {});

      const normalServingTimeList = Object.values(groupedByTime);

      const module = {
        storeId: data.storeId,
        normalServingTimeList,
        flexibleServingTimeStrList,
      };
      // 返回结果
      return module;
    } catch (error) {
      Logger.error('查询门店营业时间失败，原因：' + error);
    }
  }

  // 查询门店状态视图
  async queryShopStatusViewDetail(data: any): Promise<any> {
    const store = await this.storeRepository.findOneBy({ id: data.storeId });
    if (!store) throw new Error('门店不存在');

    // 查营业时间
    const businessHours = await this.businessHoursRepository.find({
      where: { storeId: store.id },
      order: { dayOfWeek: 'ASC' },
    });

    // 判断状态
    const statusInfo = this.calculateStatus(store, businessHours);
    const timeInfo = this.formatBusinessTime(businessHours);

    return {
      shopStatusView: {
        shopId: store.id,
        showMainStatus: {
          statusIndex: statusInfo.statusIndex,
          statusRemark: statusInfo.remark,
          statusRemarkColor: statusInfo.color,
          statusBgColor: statusInfo.bgColor,
        },
        preOrderInfo: {
          preOrderTitle: '预订单设置',
          preOrderContent: '提前0-1天预定，休息时支持预定',
        },
      },
      shopStatusClickDetail: {
        businessTime: timeInfo.simpleList,
        flexibleServingTimeStrList: timeInfo.detailList,
        businessTimeWeeks: timeInfo.weeks,
        statusDetailContent: statusInfo.detailContent,
        operationDetailsForApp: this.getOperations(
          store,
          statusInfo.canOperate,
        ),
      },
      shopInfoVO: {
        shopName: store.storeName,
        logoUrl: store.avatarImg,
      },
    };
  }

  private calculateStatus(
  store: StoreEntity,
  businessHours: StoreHoursEntity[],
) {
  // 1. 已下线（OFFLINE=0，最高优先级）
  if (store.status === StoreStatusEnum.OFFLINE) {
    return {
      status: 'offline',
      statusIndex: 4,
      remark: '门店已下线',
      color: '#FA5555',
      bgColor: '#FDF6EA',
      detailContent:"<font><em style='font-weight: 500;font-style:normal'>您的门店已经下线，无法正常营业</em><br/></font>",
      canOperate: true, // 可以上线
    };
  }

  // 2. 审核中（PENDING_AUDIT=1）
  if (store.status === StoreStatusEnum.PENDING_AUDIT) {
    return {
      status: 'pending',
      statusIndex: 1,
      remark: '审核中',
      color: '#FF9100',
      bgColor: '#FDF6EA',
      detailContent:  "<font><em style='font-weight: 500;font-style:normal'>门店正在审核中，请耐心等待</em><br/></font>",
      canOperate: false, // 不可操作
    };
  }

  // 3. 审核驳回（AUDIT_REJECTED=6）
  if (store.status === StoreStatusEnum.AUDIT_REJECTED) {
    return {
      status: 'rejected',
      statusIndex: 6,
      remark: '审核驳回',
      color: '#FA5555',
      bgColor: '#FDF6EA',
      detailContent:  "<font><em style='font-weight: 500;font-style:normal'>门店审核驳回，请修改信息后重新提交审核</em><br/></font>",
      canOperate: false, // 不可直接操作，需先修改信息
    };
  }

  // 4. 永久封禁（FORBIDDEN=5）
  if (store.status === StoreStatusEnum.FORBIDDEN) {
    return {
      status: 'forbidden',
      statusIndex: 5,
      remark: '永久封禁',
      color: '#FA5555',
      bgColor: '#FDF6EA',
      detailContent: "<font><em style='font-weight: 500;font-style:normal'>门店被永久封禁，请联系平台客服</em><br/></font>",
      canOperate: false, // 不可操作
    };
  }

  // 5. 暂停营业（PAUSE=4，商家主动暂停）
  if (store.status === StoreStatusEnum.PAUSE) {
    return {
      status: 'paused',
      statusIndex: 4,
      remark: '暂停营业',
      color: '#FF9100',
      bgColor: '#FDF6EA',
      detailContent: '<font>您已暂停营业，恢复后即可接单</font>',
      canOperate: true, // 可以恢复营业
    };
  }

  // 6. 审核通过（AUDIT_APPROVED=2，未上线）
  if (store.status === StoreStatusEnum.AUDIT_APPROVED) {
    return {
      status: 'approved',
      statusIndex: 2,
      remark: '审核通过',
      color: '#07C160',
      bgColor: '#E6F7ED',
      detailContent: "<font><em style='font-weight: 500;font-style:normal'>门店审核通过，可随时上线营业</em><br/></font>",
      canOperate: true, // 可以立即上线
    };
  }

  // 7. 营业中（ONLINE=3），检查时间
  if (store.status === StoreStatusEnum.ONLINE) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = businessHours.find((h) => h.dayOfWeek === currentDay);

    // 今天没有设置营业时间
    if (!todayHours) {
      return {
        status: 'rest',
        statusIndex: 3,
        remark: '休息中',
        color: '#FF9100',
        bgColor: '#FDF6EA',
        detailContent: "<font><em style='font-weight: 500;font-style:normal'>今日未设置营业时间，客户可以预定</em><br/></font>",
        canOperate: true, // 可以关店/下线
      };
    }

    // 检查是否在营业时间内
    const [startH, startM] = todayHours.startTime.split(':').map(Number);
    const [endH, endM] = todayHours.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const isInTime = currentTime >= startMinutes && currentTime <= endMinutes;

    if (isInTime) {
      return {
        status: 'open',
        statusIndex: 3,
        remark: '营业中',
        color: '#07C160',
        bgColor: '#E6F7ED',
        detailContent:"<font><em style='font-weight: 500;font-style:normal'>当前在营业时间内，正常接单中</em><br/></font>",
        canOperate: true, // 可以关店/下线
      };
    } else {
      return {
        status: 'rest',
        statusIndex: 3,
        remark: '休息中',
        color: '#FF9100',
        bgColor: '#FDF6EA',
        detailContent: "<font><em style='font-weight: 500;font-style:normal'>当前不在营业时间，客户可以预定</em><br/></font>",
        canOperate: true, // 可以关店/下线
      };
    }
  }

  // 默认（未知状态）
  return {
    status: 'unknown',
    statusIndex: 0,
    remark: '未知状态',
    color: '#999999',
    bgColor: '#F5F5F5',
    detailContent:"<font><em style='font-weight: 500;font-style:normal'>状态异常，请联系客服</em><br/></font>",
    canOperate: false,
  };
}

  // // 核心状态判断
  // private calculateStatus(
  //   store: StoreEntity,
  //   businessHours: StoreHoursEntity[],
  // ) {
  //   // 1. 下线状态（最高优先级）
  //   if (store.online === 0) {
  //     return {
  //       status: 'offline',
  //       statusIndex: 4,
  //       remark: '门店已下线',
  //       color: '#FA5555',
  //       bgColor: '#FDF6EA',
  //       detailContent:
  //         "<font><em style='font-weight: 500;font-style:normal'>您的门店已经下线，无法正常营业</em><br/></font>",
  //       canOperate: false,
  //     };
  //   }

  //   // 2. 审核中
  //   if (store.status === 0) {
  //     return {
  //       status: 'pending',
  //       statusIndex: 1,
  //       remark: '审核中',
  //       color: '#FF9100',
  //       bgColor: '#FDF6EA',
  //       detailContent: '<font>门店正在审核中，请耐心等待</font>',
  //       canOperate: false,
  //     };
  //   }

  //   // 3. 被平台暂停
  //   if (store.status === 3) {
  //     return {
  //       status: 'suspended',
  //       statusIndex: 5,
  //       remark: '被平台暂停',
  //       color: '#FA5555',
  //       bgColor: '#FDF6EA',
  //       detailContent: '<font>门店被平台暂停，请联系客服</font>',
  //       canOperate: false,
  //     };
  //   }

  //   // 4. 暂停营业（商家主动）
  //   if (store.status === 2) {
  //     return {
  //       status: 'paused',
  //       statusIndex: 3,
  //       remark: '暂停营业',
  //       color: '#FF9100',
  //       bgColor: '#FDF6EA',
  //       detailContent: '<font>您已暂停营业，恢复后即可接单</font>',
  //       canOperate: true, // 可以恢复营业
  //     };
  //   }

  //   // 5. 营业中，检查时间
  //   if (store.status === 1) {
  //     const now = new Date();
  //     const currentDay = now.getDay();
  //     const currentTime = now.getHours() * 60 + now.getMinutes();

  //     const todayHours = businessHours.find((h) => h.dayOfWeek === currentDay);

  //     // 今天没有设置营业时间
  //     if (!todayHours) {
  //       return {
  //         status: 'rest',
  //         statusIndex: 3,
  //         remark: '休息中',
  //         color: '#FF9100',
  //         bgColor: '#FDF6EA',
  //         detailContent: '<font>今日未设置营业时间，客户可以预定</font>',
  //         canOperate: true,
  //       };
  //     }

  //     // 检查是否在营业时间内
  //     const [startH, startM] = todayHours.startTime.split(':').map(Number);
  //     const [endH, endM] = todayHours.endTime.split(':').map(Number);
  //     const startMinutes = startH * 60 + startM;
  //     const endMinutes = endH * 60 + endM;

  //     const isInTime = currentTime >= startMinutes && currentTime <= endMinutes;

  //     if (isInTime) {
  //       return {
  //         status: 'open',
  //         statusIndex: 2,
  //         remark: '营业中',
  //         color: '#07C160',
  //         bgColor: '#E6F7ED',
  //         detailContent: '<font>当前在营业时间内，正常接单中</font>',
  //         canOperate: true,
  //       };
  //     } else {
  //       return {
  //         status: 'rest',
  //         statusIndex: 3,
  //         remark: '休息中',
  //         color: '#FF9100',
  //         bgColor: '#FDF6EA',
  //         detailContent: '<font>当前不在营业时间，客户可以预定</font>',
  //         canOperate: true,
  //       };
  //     }
  //   }

  //   // 默认
  //   return {
  //     status: 'unknown',
  //     statusIndex: 0,
  //     remark: '未知状态',
  //     color: '#999999',
  //     bgColor: '#F5F5F5',
  //     detailContent: '<font>状态异常，请联系客服</font>',
  //     canOperate: false,
  //   };
  // }


// 操作按钮（完全匹配枚举状态）
private getOperations(store: StoreEntity, canOperate: boolean) {
  if (!canOperate) return [];

  const operations = [];

  // 1. 已下线（OFFLINE=0）：立即上线
  if (store.status === StoreStatusEnum.OFFLINE) {
    operations.push({
      code: 1,
      operationTitle: '立即上线',
      operationRemark: '恢复门店上线，审核通过后即可营业',
      setAsh: false,
      needShow: true,
    });
    return operations;
  }

  // 2. 审核通过（AUDIT_APPROVED=2）：立即上线
  if (store.status === StoreStatusEnum.AUDIT_APPROVED) {
    operations.push({
      code: 1,
      operationTitle: '立即上线',
      operationRemark: '上线后门店将正常营业接单',
      setAsh: false,
      needShow: true,
    });
    return operations;
  }

  // 3. 暂停营业（PAUSE=4）：恢复营业
  if (store.status === StoreStatusEnum.PAUSE) {
    operations.push({
      code: 1,
      operationTitle: '恢复营业',
      operationRemark: '按营业时间自动开关店',
      setAsh: false,
      needShow: true,
    });
    return operations;
  }

  // 4. 营业中/休息中（ONLINE=3）：关店/下线操作
  if (store.status === StoreStatusEnum.ONLINE) {
    // 5分钟后关店
    operations.push({
      code: 2,
      operationTitle: '5分钟后关店',
      operationRemark: '延迟关店，处理完现有订单',
      setAsh: false,
      needShow: true,
    });
    // 立即关店（暂停营业）
    operations.push({
      code: 3,
      operationTitle: '立即关店',
      operationRemark: '立即暂停营业，不再接收新订单',
      setAsh: false,
      needShow: true,
    });
    // 门店下线（需审核）
    operations.push({
      code: 4,
      operationTitle: '门店下线',
      operationRemark: '长期下线，需重新审核才能上线',
      setAsh: false, // 原逻辑是置灰，根据需求调整
      needShow: true,
    });
  }

  return operations;
}

  // 格式化营业时间（同上）
  private formatBusinessTime(businessHours: StoreHoursEntity[]) {
    if (!businessHours.length) {
      return { simpleList: [], detailList: [], weeks: [] };
    }

    // ✅ 数字转中文映射（0=周日，1=周一...6=周六）
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 按时间段分组（dayOfWeek是数字）
    const timeGroups = businessHours.reduce((acc, hour) => {
      const timeKey = `${hour.startTime}-${hour.endTime}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(hour.dayOfWeek); // 存数字
      return acc;
    }, {});

    // 简化格式 ["09:00 - 22:00"]
    const simpleList = Object.keys(timeGroups).map((time) => {
      const [start, end] = time.split('-');
      return `${start} - ${end}`;
    });

    // ✅ 详细格式：数字转中文后再拼接
    const detailList = Object.entries(timeGroups).map(
      ([time, days]: [string, number[]]) => {
        // days是数字数组[1,2,3]，用weekMap转中文
        const dayNames = days.map((d) => weekMap[d]).join('、');
        return `${dayNames} ${time}`;
      },
    );

    // ✅ 返回weeks（数字转1-7格式，0变7）
    const weeks = businessHours.map((h) =>
      h.dayOfWeek === 0 ? 7 : h.dayOfWeek,
    );

    return { simpleList, detailList, weeks };
  }

  // // 操作按钮（根据状态显示不同）
  // private getOperations(store: StoreEntity, canOperate: boolean) {
  //   if (!canOperate) return [];

  //   const operations = [];

  //   // 下线状态：只能上线
  //   if (store.online === 0) {
  //     operations.push({
  //       code: 1,
  //       operationTitle: '立即上线',
  //       operationRemark: '恢复门店上线',
  //       setAsh: false,
  //       needShow: true,
  //     });
  //     return operations;
  //   }

  //   // 暂停营业：恢复营业
  //   if (store.status === 2) {
  //     operations.push({
  //       code: 1,
  //       operationTitle: '恢复营业',
  //       operationRemark: '按营业时间自动开关店',
  //       setAsh: false,
  //       needShow: true,
  //     });
  //     return operations;
  //   }

  //   // 营业中/休息中：关店操作
  //   if (store.status === 1) {
  //     operations.push(
  //       {
  //         code: 2,
  //         operationTitle: '5分钟后关店',
  //         operationRemark: '延迟关店，处理完现有订单',
  //         setAsh: false,
  //         needShow: true,
  //       },
  //       {
  //         code: 3,
  //         operationTitle: '立即关店',
  //         operationRemark: '立即暂停营业，谨慎操作',
  //         setAsh: false,
  //         needShow: true,
  //       },
  //       {
  //         code: 4,
  //         operationTitle: '门店下线',
  //         operationRemark: '长期下线，需重新审核',
  //         setAsh: true, // 置灰
  //         needShow: true,
  //       },
  //     );
  //   }

  //   return operations;
  // }
}
