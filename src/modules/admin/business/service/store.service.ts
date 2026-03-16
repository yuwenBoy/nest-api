import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
} from 'typeorm';
import { PageListVo } from 'src/modules/common/page/pageList';
import { StoreEntity } from 'src/entities/store/store.entity';
import { EmployeeEntity } from 'src/entities/store/employee.entity';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { UserInfoDto } from '../../system/dto/user/userInfo.dto';
import { UpdateStoreDTO } from '../dto/UpdateStoreDto';
import { StoreStatusEnum } from 'src/enum/business_enum';
import { AuditLogEntity } from 'src/entities/business/audit_log.entity';

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
    StoreStatusEnum.OFFLINE,        // 已下线
    StoreStatusEnum.PENDING_AUDIT,  // 审核中
    StoreStatusEnum.AUDIT_REJECTED  // 审核驳回
  ];

  // 3. 状态校验
  if (!allowModifyStatusList.includes(store.status)) {
    // 针对不同禁止状态，返回精准提示（提升商家体验）
    switch (store.status) {
      case StoreStatusEnum.ONLINE:
        throw new BadRequestException('当前门店为营业中状态，无法直接修改，请先手动下线后再提交修改申请');
      case StoreStatusEnum.AUDIT_APPROVED:
        throw new BadRequestException('当前门店审核已通过（待上线），无需修改，可直接点击上线');
      case StoreStatusEnum.PAUSE:
        throw new BadRequestException('当前门店为暂停营业状态，需先恢复营业后下线，再提交修改申请');
      case StoreStatusEnum.FORBIDDEN:
        throw new BadRequestException('当前门店已被永久封禁，无法修改信息');
      default:
        throw new BadRequestException('当前门店状态不允许修改');
    }
  }

    // // 3. 业务类型校验：不可修改（前端已禁用，后端二次校验）
    // if (store.businessType !== dto.businessType) {
    //   throw new BadRequestException('业务类型不可修改，如需变更请重新入驻');
    // }

    // 4. 获取当前资质信息（用于生成beforeData）
    // const currentQual = await this.storeQualRepo.findOne({ where: { storeId } });
    // if (!currentQual) {
    //   throw new NotFoundException('门店资质信息不存在');
    // }

    // 5. 生成修改前后快照（JSON格式，对齐前端参数）
    const beforeData = {
      store: {
        storeName: store.storeName,
        // businessCategory: store.businessCategory,
        // businessType: store.businessType,
        doorPhoto: store.doorPhoto,
        envPhoto: store.envPhoto,
        district_code: store.district_code,
        detail_address: store.detail_address,
        latitude: store.latitude,
        longitude: store.longitude,
      },
      //   licenseInfo: {
      //     license_type: currentQual.licenseType,
      //     license_pic: currentQual.licensePic,
      //     license_no: currentQual.licenseNo,
      //     company_name: currentQual.companyName,
      //     legal_person: currentQual.legalPerson,
      //     license_plan: currentQual.licensePlan,
      //     license_valid_date: currentQual.licenseValidDate,
      //     is_long_term: currentQual.isLongTerm,
      //   },
      //   permitInfo: {
      //     permit_type: currentQual.permitType,
      //     permit_pic: currentQual.permitPic,
      //     permit_no: currentQual.permitNo,
      //     permit_name: currentQual.permitName,
      //     permit_legalPerson: currentQual.permitLegalPerson,
      //     permit_address: currentQual.permitAddress,
      //     permit_mainBusiness: currentQual.permitMainBusiness,
      //     permit_scope: currentQual.permitScope,
      //     permit_expireDate: currentQual.permitExpireDate,
      //     is_rang_date: currentQual.isRangDate,
      //   },
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
      //   bizType: 'store_modify', // 门店修改
      targetType: 2, // 门店修改
      targetId: storeId,
      status: 0, // 待审核
      beforeData,
      afterData,
      applicantId: userId,
    });
    const savedAudit = await this.auditRepo.save(auditLog);

    // 7. 更新门店基础信息（状态改为审核中）
    // store.storeName = dto.storeName;
    // // store.businessCategory = dto.businessCategory;
    // store.doorPhoto = dto.doorPhoto;
    // store.envPhoto = dto.envPhoto;
    // store.district_code = dto.district_code;
    // store.detail_address = dto.detail_address;
    // store.latitude = dto.latitude;
    // store.longitude = dto.longitude;
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
   * 获取门店信息
   * @param storeId 门店ID
   */
  async getStoreInfo(storeId:number):Promise<any>{
      try {
        const store = await this.storeRepository.findOne({
          where: { id: storeId },
        });
        const auditLog = await this.auditRepo.findOne({
          where: { targetType: 2, targetId: storeId },
          order: { createdAt: 'DESC' },
        });
        
        if (!store) {
          throw new NotFoundException('门店不存在');
        }
        return {...auditLog, store};
      } catch (error) {
        Logger.error(`获取门店信息失败，原因：${JSON.stringify(error)}`);
        throw new HttpException(
          '获取门店信息失败',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
  }
}
