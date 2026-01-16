import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { Brackets, EntityManager, getRepository, In, Repository } from 'typeorm';
import { PageListVo } from 'src/modules/common/page/pageList';
import {  StoreHoursEntity } from 'src/entities/store/store_hours.entity';
import { StoreEntity } from 'src/entities/store/store.entity';

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
      async pageQuery(parameter: any,business_id:number): Promise<PageListVo> {
        try {
         const [pageIndex, pageSize] = [parameter.page, parameter.size];
              let qb = await this.businessHoursRepository
                .createQueryBuilder('hours')
                .innerJoinAndMapOne(
                  'hours.business',
                  BusinessEntity,
                  'business',
                  'hours.business_id=business.id',
                ).where(
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
          throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      /**
       * 修改营业时间
       * @param requestData 
       */
      async updateShopServingTime(data:any):Promise<any>{
          try {
              const store = await this.storeRepository.findOne(data.params.storeId);
              if(!store){
                  throw new Error('Store not found');
              }

            //   const timeSlots = data.params.normalServingTimeList.flatMap((timeSlot)=>{
            //     return timeSlot.weeks.map((dayOfWeek)=>{
            //         return timeSlot.buinessHours.map((businessHour)=>{
            //             storeId:store.id
            //             dayOfWeek:dayOfWeek,
            //             startTime:businessHour.startTime,
            //             endTime:businessHour.endTime,
            //         })
            //     })
            //   })

            //   await this.businessHoursRepository.save(timeSlots);

          } catch (error) {
             Logger.error('营业时间修改失败，原因：'+error);
          }
      }
    }
