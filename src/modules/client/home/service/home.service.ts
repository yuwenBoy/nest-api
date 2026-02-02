import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StoreEntity } from "src/entities/store/store.entity";
import { PageListVo } from "src/modules/common/page/pageList";
import { Repository } from "typeorm";

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
     ) {}

     /**
             * 查询分页列表
             * @param parameter 查询条件
             * @returns list
             */
          async pageQuery(parameter: any): Promise<PageListVo> {
            try {
                const [pageIndex, pageSize] = [parameter.page, parameter.size];
                  let qb = await this.storeRepository
                    .createQueryBuilder('store')
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
              throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
            }
          }
}