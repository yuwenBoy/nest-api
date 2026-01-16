import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, getConnection, getRepository, In, Repository } from 'typeorm';
import { PageListVo } from 'src/modules/common/page/pageList';
import { StoreEntity } from 'src/entities/store/store.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { EmployeeEntity } from 'src/entities/store/employee.entity';
import { UserService } from '../../system/service/user.service';
import { UserRoleService } from '../../system/service/userRole.service';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { UserInfoDto } from '../../system/dto/user/userInfo.dto';
import { Store } from 'express-rate-limit';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreEntity)
        private storeRepository: Repository<StoreEntity>,
        @InjectRepository(BusinessEntity)
        private businessRepository:Repository<BusinessEntity>,
        @InjectRepository(EmployeeEntity)
        private employeeRepository:Repository<EmployeeEntity>,
      ) {}
      
      /**
         * 查询分页列表
         * @param parameter 查询条件
         * @returns list
         */
      async pageQuery(parameter: any,userInfo:UserInfoDto): Promise<PageListVo> {
        try {
            const [pageIndex, pageSize] = [parameter.page, parameter.size];
            Logger.log('userInfo.id'+userInfo.id)
                // 查询员工记录
            const employee = await this.employeeRepository.findOne({ where: { user_id:userInfo.id } });

            Logger.log('查询员工记录'+employee)
            const storeId = employee ? employee.store_id : null;
              let qb = await this.storeRepository
                .createQueryBuilder('store')
                .innerJoinAndMapOne(
                  'store.business',
                  BusinessEntity,
                  'business',
                  'store.business_id=business.id',
                ).where(
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
          throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    // 新增门店
    async createStore(storeData:any, businessId: number): Promise<any> {
        const business = await this.businessRepository.findOne({ where: { id: businessId } });
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
    async updateStore(storeData:any): Promise<any> {
        const store = await this.storeRepository.findOne({ where: { id:storeData.id } });
        if (!store) {
        throw new NotFoundException(`Store with ID ${storeData.id} not found`);
        }

        await this.storeRepository.update(storeData.id, storeData);
        return this.storeRepository.findOne({ where: { id:storeData.id } });
    }

    /**
     * 根据商家获取全部门店信息
     * @param businessId 商家ID
     */
    async getStoreList(businessId:number):Promise<any>{
       return await this.storeRepository.find({where:{business_id:businessId}})
    }
}
