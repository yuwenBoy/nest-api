import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessEntity } from '../../../../entities/business/business.entity';
import { Brackets, EntityManager, getRepository, In, Repository } from 'typeorm';
import { PageListVo } from '../../../common/page/pageList';
import { BusinessAccountEntity } from '../../../../entities/business/business_account.entity';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(BusinessEntity)
        private merchantRepository: Repository<BusinessEntity>,
        @InjectRepository(BusinessAccountEntity)
        private readonly businessAccountRepository: Repository<BusinessAccountEntity>,
      ) {}
      
      /**
         * 查询分页列表
         * @param parameter 查询条件
         * @returns list
         */
      async pageQuery(parameter: any,business_id:number): Promise<PageListVo> {
        try {
         const [pageIndex, pageSize] = [parameter.page, parameter.size];
              let qb = await this.businessAccountRepository
                .createQueryBuilder('account')
                .innerJoinAndMapOne(
                  'account.business',
                  BusinessEntity,
                  'business',
                  'account.business_id=business.id',
                ).where(
                  new Brackets((qb) => {
                    if (business_id) {
                        qb.andWhere('account.business_id = :business_id', { business_id });
                      }
                      if (parameter.userName) {
                        qb.andWhere('account.username LIKE :userName', {
                          userName: `%${parameter.userName}%`,
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
    }
