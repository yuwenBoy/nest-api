import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { BusinessAuditEntity } from 'src/entities/business/business_audit.entity';
import { Brackets, EntityManager, getRepository, In, Repository } from 'typeorm';
import { CreateMerchantApplicationDto } from '../dto/CreateMerchantApplicationDto';
import { BusinessAuditStatusEnum, BusinessStatusEnum, StoreOnlineEnum, StoreStatusEnum } from 'src/enum/business_enum';
import { BusinessCategoryRelationEntity } from 'src/entities/business/business_category_relation.entity';
import { BusinessCategoryEntity } from 'src/entities/business/category.entity';
import { PageListVo } from 'src/modules/common/page/pageList';
import { CreateMerchantAuditApplicationDto } from '../dto/CreateMerchantAuditApplicationDto';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { BusinessAccountEntity } from 'src/entities/business/business_account.entity';
import { ConfigService } from '@nestjs/config';
import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';
import { EmailService } from 'src/modules/common/services/email/email.service';
import { compareSync, hashSync } from 'bcryptjs';
import { UserTypeEnum } from 'src/enum/admin_enum';
import { StoreEntity } from 'src/entities/store/store.entity';

@Injectable()
export class BusinessService {
    constructor(
        @InjectRepository(BusinessEntity)
        private merchantRepository: Repository<BusinessEntity>,
        @InjectRepository(BusinessAuditEntity)
        private readonly businessAuditRepository: Repository<BusinessAuditEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(BusinessEntity)
        private readonly businessRepository: Repository<BusinessEntity>,
         private readonly config: ConfigService,

         private readonly emailService:EmailService,
      ) {}

  /**
         * 商家信息查询分页列表
         * @param parameter 查询条件
         * @returns list
         */
  async getBusinessList(parameter: any,business_id:number): Promise<PageListVo> {
    try {
          const [pageIndex, pageSize] = [parameter.page, parameter.size];
          let qb = await this.businessRepository
            .createQueryBuilder('business')
            .innerJoinAndMapOne(
                'business.businessCategoryRelation',
                BusinessCategoryRelationEntity,  
                'bcr',
                'business.id=bcr.business_id',
              ).innerJoinAndMapMany(
                  'business.businessCategory',
                  BusinessCategoryEntity,
                  'bc',
                  'bcr.category_id=bc.id',
                )
             .where(
              new Brackets((qb) => {
                if(business_id){
                    return qb.andWhere('business.id=:business_id', {
                        business_id: business_id,
                    });
                }
               else{
                return qb;
               }
              }),
            ).andWhere(new Brackets((qb)=>{
                if (parameter.title) {
                    return qb.where(
                      'business.title LIKE :title',
                      {
                        title: `%${parameter.title}%`,
                      },
                    );
                  } else {
                    return qb;
                  }
            })).andWhere(
                new Brackets((qb) => {
                  if (parameter.status) {
                    return qb.andWhere('business.status=:status', {
                        status: parameter.status,
                    });
                  } else {
                    return qb;
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
      throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

      
      /**
         * 查询分页列表
         * @param parameter 查询条件
         * @returns list
         */
      async pageQuery(parameter: any): Promise<PageListVo> {
        try {
         const [pageIndex, pageSize] = [parameter.page, parameter.size];
              let qb = await this.businessAuditRepository
                .createQueryBuilder('audit')
                .innerJoinAndMapOne(
                  'audit.business',
                  BusinessEntity,
                  'business',
                  'audit.business_id=business.id',
                ).innerJoinAndMapMany(
                    'audit.businessCategoryRelation',
                    BusinessCategoryRelationEntity,
                    'bc',
                    'audit.business_id=bc.business_id',
                  ).where('audit.status = :status', { status: 0 })
                .andWhere(
                  new Brackets((qb) => {
                    if (parameter.title) {
                      return qb.andWhere(
                        'business.title LIKE :title',
                        {
                          title: `%${parameter.title}%`,
                        },
                      );
                    } else {
                      return qb;
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
          throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      /**
       * 商家入驻申请
       * @param dto 
       * @returns 
       */
      async create(dto: CreateMerchantApplicationDto): Promise<BusinessAuditEntity> {
        return this.merchantRepository.manager.transaction(async (transactionalEntityManager) => {
          try {
                // 创建商家实体
            const merchant = transactionalEntityManager.create(BusinessEntity, {
                title: dto.title,
                contactName: dto.contactName,
                contactPhone: dto.contactPhone,
                email: dto.email,
                address: dto.address,
                businessLicense: dto.businessLicense,
                healthLicense: dto.healthLicense,
                logoUrl: dto.logoUrl,
                coverUrl: dto.coverUrl,
                description: dto.description,
            });
        
            // 保存商家表
            const savedMerchant = await transactionalEntityManager.save(merchant);
        
            // 创建商家审核表
            const application = transactionalEntityManager.create(BusinessAuditEntity, {
                business_id: savedMerchant.id, // 明确设置外键字段
                status: BusinessAuditStatusEnum.APPLYIN,
                reason:'',
            });
        
            // 保存商家审核
            const savedApplication = await transactionalEntityManager.save(application);

            // 创建首个门店
            const firstStore = transactionalEntityManager.create(StoreEntity, {
                storeName:'默认门店',
                business_id: savedMerchant.id,
                address: savedMerchant.address,
                // status: StoreStatusEnum.APPLYIN, // 待审核
                // online: StoreOnlineEnum.DOWNLINE, // 门店已下线
                contactInfo: savedMerchant.contactPhone,
                remark: '门店简介：新店开业，请多多关照',
                notice: '你好，欢迎光临',
                // latitude:0.3,
                // longitude:0.3
                avatarImg: '',
                isDefault: 1, // 默认门店
            });

            await transactionalEntityManager.save(firstStore);

            Logger.log('保存商家审核',savedApplication);
        
            // 如果提供了分类 ID，则创建关联
            if (dto.categories && dto.categories.length>0) {
                const categoryIds = dto.categories.map(id => Number(id));
                const categories = await transactionalEntityManager.find(BusinessCategoryEntity, {
                where: { id: In(categoryIds) },
                });
        
                if (categories.length !== categoryIds.length) {
                throw new NotFoundException(`One or more categories not found`);
                }
        
                for (const category of categories) {
                const merchantCategory = transactionalEntityManager.create(BusinessCategoryRelationEntity, {
                    businessId: savedMerchant.id,
                    categoryId: category.id,
                });
                Logger.log('看一下关联表',merchantCategory,savedMerchant.id,category.id)
                await transactionalEntityManager.save(merchantCategory);
                }
            }
        
            return savedApplication;
          } catch (error) {
            console.error('审核失败', error);
            throw new Error('审核失败');
          }
        });
      }

      private async sendAuditNotification(
            email: string | null | undefined,
            status: 'success' | 'error',
            account: string,
            reason?: string
        ): Promise<void> {
              if (!email) {
                throw new Error('商家邮箱未定义，无法发送通知');
              }
            const subject = status === 'success' ? '审核通过通知' : '审核失败通知';
            const password = this.config.get<string>('business.initialPassword');
            const text = status === 'success'
            ? `尊敬的商家，您的入驻申请已通过审核。账号为：${account}，初始密码为：${password}。请尽快登录系统进行操作。`
            : `尊敬的商家，您的入驻申请未通过审核。原因：${reason}。如有疑问，请联系平台客服。`;
            await this.emailService.sendMail(email, subject, text);
      }
      

       /**
       * 平台审核入驻申请
       * @param dto 
       * @returns 
       */
       async apply(dto: CreateMerchantAuditApplicationDto,username:string): Promise<BusinessAuditEntity> {
        return this.merchantRepository.manager.transaction(async (transactionalEntityManager) => {
           try {

                // 查询审核记录
                const audit = await this.businessAuditRepository.findOneOrFail({ where: { id: parseInt(dto.id) } });

                // 查询商家信息
                const merchant = await this.merchantRepository.findOneOrFail({ where: { id: audit.business_id } });
                const password = this.config.get<string>('business.initialPassword');
                const account = this.config.get<string>('business.account');
                const roleId = this.config.get<string>('business.roleId');
                const deptId = this.config.get<string>('business.deptId');
                const positionId = this.config.get<string>('business.positionId');
                const transformAccount = 'M' +Date.now().toString().substr(7); // account + '_' + merchant.id

                if (parseInt(dto.status) === 1) {
                    // 审核通过

                     const transformPass = hashSync(password, 11);


                    // 新增商户账户信息表
                    const merchantAccount = transactionalEntityManager.create(BusinessAccountEntity, {
                        business_id: merchant.id,
                        status:0, // 待完善
                    });
                    await transactionalEntityManager.save(merchantAccount);

                    // 新增用户表
                    const user = transactionalEntityManager.create(UserEntity, {
                        business_id:merchant.id,
                        dept_id:deptId,
                        position_id:positionId,
                        username: transformAccount,
                        password: transformPass,
                        email:merchant.email,
                        phone:merchant.contactPhone,
                        cname:merchant.contactName,
                        address:merchant.address,
                        userType:UserTypeEnum.BUSINESSUSER, // 商家用户
                    });
                    await transactionalEntityManager.save(user);

                    // 设置默认角色（饿了么商家端）
                    const userRole = transactionalEntityManager.create(UserRoleEntity,{
                        userId:user.id,
                        roleId:roleId, // 商家
                        create_by:username,
                        update_by:username,
                    })
                    await transactionalEntityManager.save(userRole);

                    // 更新商家状态为活跃
                    merchant.status = BusinessStatusEnum.ACTIVE;
                    await transactionalEntityManager.save(merchant);

                    // 发送邮件通知通知审核通过
                    await this.sendAuditNotification(merchant.email,'success',transformAccount);
                }else{
                    // 发送邮件通知通知审核失败
                    await this.sendAuditNotification(merchant.email,'error',transformAccount,dto.reason);
                }
    
                // 更新审核记录
                const businessAudit = transactionalEntityManager.create(BusinessAuditEntity, {
                    id: audit.id, // 使用已存在的审核记录 ID
                    status: parseInt(dto.status)==1 ? BusinessAuditStatusEnum.SUCCESS:BusinessAuditStatusEnum.ERROR,
                    reason: dto.reason,
                });
                const savedApplication = await transactionalEntityManager.save(businessAudit);

                // // 更新门店状态
                // const stores = await transactionalEntityManager.find(StoreEntity, {
                //     where: { business_id: merchant.id },
                // });
                // for (const store of stores) {
                //     store.status = parseInt(dto.status) === 1? StoreStatusEnum.ACTIVE : StoreStatusEnum.END;
                //     await transactionalEntityManager.save(store);
                // }

                return savedApplication;
 
           } catch (error) {
                console.error('审核失败', error);
                throw new Error('审核失败');
           }
         
        });
      }
}
