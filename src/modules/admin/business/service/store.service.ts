import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { PageListVo } from '../../../common/page/pageList';
import { PauseReason, StoreEntity } from '../../../../entities/store/store.entity';
import { EmployeeEntity } from '../../../../entities/store/employee.entity';
import { BusinessEntity } from '../../../../entities/business/business.entity';
import { UserInfoDto } from '../../system/dto/user/userInfo.dto';
import { UpdateStoreDTO } from '../dto/UpdateStoreDto';
import {
  StoreOperationTypeEnum,
  StoreStatusEnum,
} from '../../../../enum/business_enum';
import { AuditLogEntity } from '../../../../entities/business/audit_log.entity';
import { AuditStatusEnum, AuditTargetType } from '../../../../enum/audit_enum';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(AuditLogEntity)
    private auditRepo: Repository<AuditLogEntity>,
  ) {}

  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any, userInfo: UserInfoDto): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      Logger.log('userInfo.id' + userInfo.id);
      // 查询员工记录
      const employee = await this.employeeRepository.findOne({
        where: { user_id: userInfo.id },
      });
      const storeId = employee ? employee.store_id : null;
      let qb = await this.storeRepository
        .createQueryBuilder('store')
        .innerJoinAndMapOne(
          'store.business',
          BusinessEntity,
          'business',
          'store.business_id=business.id',
        )
        .where(
          new Brackets((qb) => {
            if (storeId) {
              qb.andWhere('store.id = :storeId', { storeId });
            }
            if (parameter.storeName) {
              qb.andWhere('store.store_name LIKE :storeName', {
                storeName: `%${parameter.storeName}%`,
              });
            }
            if (parameter.contactInfo) {
              qb.andWhere('store.contact_info LIKE :contactInfo', {
                contactInfo: `%${parameter.contactInfo}%`,
              });
            }
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
  // 新增门店
  async createStore(storeData: any, businessId: number): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const newStore = this.storeRepository.create({
      ...storeData,
      business,
    });

    return this.storeRepository.save(newStore);
  }

  // 编辑门店
  async updateStore(storeData: any): Promise<any> {
    const store = await this.storeRepository.findOne({
      where: { id: storeData.id },
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeData.id} not found`);
    }

    await this.storeRepository.update(storeData.id, storeData);
    return this.storeRepository.findOne({ where: { id: storeData.id } });
  }

  /**
   * 根据商家获取全部门店信息
   * @param businessId 商家ID
   */
  async getStoreList(businessId: number): Promise<any> {
    return await this.storeRepository.find({
      where: { business_id: businessId },
    });
  }

  /**
   * 修改门店信息并提交审核（核心方法）
   * @param storeId 门店ID
   * @param dto 修改内容
   * @param userId 当前登录商家用户ID
   */
  async updateStoreAndSubmitAudit(
    dto: UpdateStoreDTO,
    userId: number,
  ): Promise<{ auditId: number; message: string }> {
    let storeId = dto.storeId;
    // 1. 权限校验：用户是否属于该门店的商家
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    const allowModifyStatusList = [
      StoreStatusEnum.OFFLINE, // 已下线
      StoreStatusEnum.PENDING_AUDIT, // 审核中
      StoreStatusEnum.AUDIT_REJECTED, // 审核驳回
    ];

    // 3. 状态校验
    if (!allowModifyStatusList.includes(store.status)) {
      // 针对不同禁止状态，返回精准提示（提升商家体验）
      switch (store.status) {
        case StoreStatusEnum.ONLINE:
          throw new BadRequestException(
            '当前门店为营业中状态，无法直接修改，请先手动下线后再提交修改申请',
          );
        case StoreStatusEnum.AUDIT_APPROVED:
          throw new BadRequestException(
            '当前门店审核已通过（待上线），无需修改，可直接点击上线',
          );
        case StoreStatusEnum.PAUSE:
          throw new BadRequestException(
            '当前门店为暂停营业状态，需先恢复营业后下线，再提交修改申请',
          );
        case StoreStatusEnum.FORBIDDEN:
          throw new BadRequestException('当前门店已被永久封禁，无法修改信息');
        default:
          throw new BadRequestException('当前门店状态不允许修改');
      }
    }

    // 5. 生成修改前后快照（JSON格式，对齐前端参数）
    const beforeData = {
      store: {
        storeName: store.storeName,
        avatarImg: store.avatarImg,
        // businessCategory: store.businessCategory,
        // businessType: store.businessType,
        doorPhoto: store.doorPhoto,
        envPhoto: store.envPhoto,
        district_code: store.district_code,
        detail_address: store.detail_address,
        latitude: store.latitude,
        longitude: store.longitude,
      },
    };

    const afterData = {
      store: {
        storeName: dto.storeName,
        // businessCategory: dto.businessCategory,
        // businessType: dto.businessType,
        doorPhoto: dto.doorPhoto,
        envPhoto: dto.envPhoto,
        district_code: dto.districtCode,
        detail_address: dto.detailAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      licenseInfo: dto.licenseInfo,
      permitInfo: dto.permitInfo,
    };

    // 6. 创建审核记录
    const auditLog = this.auditRepo.create({
      targetType: AuditTargetType.STORE_MODIFY,
      targetId: storeId,
      status: AuditStatusEnum.PENDING,
      beforeData,
      afterData,
      applicantId: userId,
    });
    const savedAudit = await this.auditRepo.save(auditLog);
    store.status = StoreStatusEnum.PENDING_AUDIT;
    store.offlineType = 0;
    store.syncOnlineStatus(); // 联动online=0
    await this.storeRepository.save(store);
    return {
      auditId: savedAudit.id,
      message: '门店信息修改已提交审核，请等待平台审核',
    };
  }

  /**
   * 门店头像修改
   * @param dto 
   * @param userId 
   * @returns 
   */
  async modifyShopAvatar( dto: any,
    userId: number,):Promise<{ auditId: number; message: string }> {
    let storeId = dto.storeId;
    // 1. 权限校验：用户是否属于该门店的商家
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    // 5. 生成修改前后快照（JSON格式，对齐前端参数）
    const beforeData = {
      store: {
        avatarImg: store.avatarImg,
      },
    };
    const afterData = {
      store: {
        avatarUrl: dto.avatarUrl,
      },
    };

    // 6. 创建审核记录
    const auditLog = this.auditRepo.create({
      targetType: AuditTargetType.STORE_AVATAR,
      targetId: storeId,
      status: AuditStatusEnum.PENDING,
      beforeData,
      afterData,
      applicantId: userId,
    });
    const savedAudit = await this.auditRepo.save(auditLog);
    return {
      auditId: savedAudit.id,
      message: '门店头像修改已提交审核，请等待平台审核',
    };
  }

  /**
   * 获取门店信息
   * @param storeId 门店ID
   */
  async getStoreInfo(storeId: number): Promise<any> {
    try {
      const store = await this.storeRepository.findOne({
        where: { id: storeId },
      });
      const auditLog = await this.auditRepo.findOne({
      where: { targetType: AuditTargetType.STORE_MODIFY, targetId: storeId },
      order: { createdAt: 'DESC' },
    });

      if (!store) {
        throw new NotFoundException('门店不存在');
      }
      return { ...auditLog, store };
    } catch (error) {
      Logger.error(`获取门店信息失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取门店信息失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 统一处理门店营业状态操作
   */
  async handleStoreOperation(operationType: StoreOperationTypeEnum, dto: any) {
    const { storeId, delay = 5 } = dto;

    // 1. 查询门店（排除永久封禁的门店）
    const store = await this.storeRepository.findOne({
      where: { id: storeId, status: Not(StoreStatusEnum.FORBIDDEN) },
    });
    if (!store) {
      throw new NotFoundException(`门店ID ${storeId} 不存在或已被永久封禁`);
    }

    // 2. 按操作类型处理（核心：适配你的状态）
    switch (operationType) {
      case StoreOperationTypeEnum.ONLINE_NOW:
        return await this.onlineShop(store); // 立即上线
      case StoreOperationTypeEnum.DELAY_PAUSE:
        return await this.closeShopDelay(store, delay); // 5分钟后关店（暂停）
      case StoreOperationTypeEnum.PAUSE_NOW:
        return await this.closeShopImmediate(store); // 立即关店（暂停）
      case StoreOperationTypeEnum.OFFLINE_MANUAL:
        return await this.offlineShop(store); // 手动下线
      default:
        throw new BadRequestException('不支持的操作类型');
    }
  }

  /**
   * case 1：立即上线/恢复营业
   * 状态流转：OFFLINE(0)/PAUSE(4)/AUDIT_APPROVED(2) → ONLINE(3)
   * 限制：审核中(1)/驳回(6)/封禁(5) 不能直接上线
   */
  private async onlineShop(store: StoreEntity) {
    // 校验状态合法性
    const allowStatus = [
      StoreStatusEnum.OFFLINE,
      StoreStatusEnum.PAUSE,
      StoreStatusEnum.AUDIT_APPROVED,
    ];
    if (!allowStatus.includes(store.status)) {
      const statusText = this.getStatusText(store.status);
      throw new BadRequestException(
        `当前门店状态为【${statusText}】，无法立即上线`,
      );
    }

    // 更新状态为营业中，清除定时暂停任务
    await this.storeRepository.update(store.id, {
      status: StoreStatusEnum.ONLINE,
      //   closeDelayTime: null, // 清空定时关店时间
      updatedAt: new Date(),
    });
    // await this.redisService.del(`store:delay_pause:${store.id}`);

    return { code: 0, msg: '门店上线成功' };
  }

  /**
   * case 2：5分钟后关店（转为暂停营业）
   * 状态流转：ONLINE(3) → 记录定时时间，到期后转为PAUSE(4)
   * 限制：仅营业中(3)可设置定时暂停
   */
  private async closeShopDelay(store: StoreEntity, delay: number) {
    if (store.status !== StoreStatusEnum.ONLINE) {
      const statusText = this.getStatusText(store.status);
      throw new BadRequestException(
        `仅营业中的门店可设置定时关店，当前状态为【${statusText}】`,
      );
    }

    // 计算定时暂停时间
    const pauseTime = new Date();
    pauseTime.setMinutes(pauseTime.getMinutes() + delay);

    // 更新门店（仅记录定时时间，状态仍为营业中，到期后定时任务改为暂停）
    await this.storeRepository.update(store.id, {
      //   closeDelayTime: pauseTime,
      updatedAt: new Date(),
      pauseReason: PauseReason.MERCHANT,
    });

    // // 存入Redis供定时任务扫描
    // await this.redisService.set(
    //   `store:delay_pause:${store.id}`,
    //   JSON.stringify({ storeId: store.id, pauseTime: pauseTime.getTime() }),
    //   delay * 60, // 过期时间=延时分钟数（秒）
    // );

    return { code: 0, msg: `已设置${delay}分钟后关店` };
  }

  /**
   * case 3：立即关店（转为暂停营业）
   * 状态流转：ONLINE(3) → PAUSE(4)
   * 限制：仅营业中(3)可立即暂停
   */
  private async closeShopImmediate(store: StoreEntity) {
    if (store.status !== StoreStatusEnum.ONLINE) {
      const statusText = this.getStatusText(store.status);
      throw new BadRequestException(
        `仅营业中的门店可立即关店，当前状态为【${statusText}】`,
      );
    }

    // 更新状态为暂停营业，清空定时时间
    await this.storeRepository.update(store.id, {
      status: StoreStatusEnum.PAUSE,
      //   closeDelayTime: null,
      updatedAt: new Date(),
      pauseReason: PauseReason.MERCHANT,
    });
    // await this.redisService.del(`store:delay_pause:${store.id}`);

    return { code: 0, msg: '门店已立即关店' };
  }

  /**
   * case 4：门店下线（转为已下线）
   * 状态流转：ONLINE(3)/PAUSE(4)/AUDIT_APPROVED(2) → OFFLINE(0)
   * 限制：审核中(1)/驳回(6)/封禁(5) 不能手动下线
   */
  private async offlineShop(store: StoreEntity) {
    const allowStatus = [
      StoreStatusEnum.ONLINE,
      StoreStatusEnum.PAUSE,
      StoreStatusEnum.AUDIT_APPROVED,
    ];
    if (!allowStatus.includes(store.status)) {
      const statusText = this.getStatusText(store.status);
      throw new BadRequestException(
        `当前门店状态为【${statusText}】，无法手动下线`,
      );
    }

    // 更新状态为已下线，清空定时时间
    await this.storeRepository.update(store.id, {
      status: StoreStatusEnum.OFFLINE,
      //   closeDelayTime: null,
      updatedAt: new Date(),
      pauseReason: PauseReason.MERCHANT,
    });
    // await this.redisService.del(`store:delay_pause:${store.id}`);

    return { code: 0, msg: '门店已下线' };
  }

  //   /**
  //    * 定时任务：每分钟扫描定时暂停的门店，执行关店
  //    */
  //   @Cron('*/1 * * * *')
  //   async handleDelayPauseShop() {
  //     const now = new Date().getTime();
  //     const keys = await this.redisService.keys('store:delay_pause:*');

  //     for (const key of keys) {
  //       const data = await this.redisService.get(key);
  //       if (!data) continue;

  //       const { storeId, pauseTime } = JSON.parse(data);
  //       if (now >= pauseTime) {
  //         const store = await this.storeRepo.findOne({ where: { id: storeId } });
  //         // 仅营业中门店执行定时暂停
  //         if (store && store.status === StoreStatusEnum.ONLINE) {
  //           await this.closeShopImmediate(store);
  //         }
  //         await this.redisService.del(key);
  //       }
  //     }
  //   }

  /**
   * 辅助方法：状态值转中文描述
   */
  private getStatusText(status: StoreStatusEnum): string {
    const statusMap = {
      [StoreStatusEnum.OFFLINE]: '已下线',
      [StoreStatusEnum.PENDING_AUDIT]: '审核中',
      [StoreStatusEnum.AUDIT_APPROVED]: '审核通过',
      [StoreStatusEnum.ONLINE]: '营业中',
      [StoreStatusEnum.PAUSE]: '暂停营业',
      [StoreStatusEnum.FORBIDDEN]: '永久封禁',
      [StoreStatusEnum.AUDIT_REJECTED]: '审核驳回',
    };
    return statusMap[status] || '未知状态';
  }
}
