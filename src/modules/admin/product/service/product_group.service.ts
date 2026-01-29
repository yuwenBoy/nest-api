import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductGroupEntity } from 'src/entities/product/product_group.entity';
import { Brackets, Repository } from 'typeorm';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { StoreEntity } from 'src/entities/store/store.entity';

@Injectable()
export class ProductGroupService {
  constructor(
    @InjectRepository(ProductGroupEntity)
    private readonly productGroupRepository: Repository<ProductGroupEntity>,

    @InjectRepository(StoreEntity)
    private readonly sroreRepository: Repository<StoreEntity>,
  ) {}

  /**
   * 查询分组列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = await this.productGroupRepository
        .createQueryBuilder('productGroup')
        .innerJoinAndMapOne(
          'productGroup.store',
          StoreEntity,
          'store',
          'productGroup.store_id=store.id',
        )
        .where(
          new Brackets((qb) => {
            if (parameter.name) {
              qb.andWhere('productGroup.name LIKE :name', {
                name: `%${parameter.name}%`,
              });
            }
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            if (parameter.storeId) {
              qb.andWhere('productGroup.store_id  = :store_id', {
                store_id: parameter.storeId,
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

  /**
   * 查询全部分组
   */
  async productGroupAll(params: any): Promise<any> {
    try {
      const queryBuilder = this.productGroupRepository
        .createQueryBuilder('a') // 使用 'a' 作为 product_group 表的别名
        .select(['a.*', 'COUNT(DISTINCT b.product_id) AS product_count'])
        .leftJoin(ProductGroupRelationEntity, 'b', 'a.id = b.group_id') // 使用 'b' 作为 product_group_relation 表的别名
        .leftJoin(ProductEntity, 'c', 'b.product_id=c.id')
        .leftJoin(ProductSpecEntity, 'd', 'c.id=d.product_id')

        .where('a.store_id = :storeId', { storeId: params.storeId }); // 添加业务 ID 过滤条件

      // 已下架
      if (params.isActive == 2) {
        queryBuilder.andWhere('c.is_active = :isActive', {
          isActive: params.isActive,
        });
      }

      // 已售罄
      if (params.isActive == 3) {
        queryBuilder.andWhere('d.stock = 0');
      }
      queryBuilder.groupBy('a.id, a.name'); // 按分组 ID 和名称分组

      const groups = await queryBuilder.getRawMany();
      return {
        ...{ content: groups },
      };
    } catch (error) {
      Logger.error('查询品类失败，原因：' + error);
    }
  }

  /**
   * 新增|编辑 品类
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(
    parameter: Partial<ProductGroupEntity>,
  ): Promise<ProductGroupEntity> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      Logger.log('parameter' + parameter);

      // 必须用save 更新时间才生效
      let res = await this.productGroupRepository.save(parameter);
      if (res.id > 0) {
        return res;
      } else {
        return res;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】品类请求失败：${JSON.stringify(error)}`);
    }
  }

  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    Logger.log(`【批量删除角色】请求参数：${JSON.stringify(ids)}`);
    try {
      // // 查询角色是否有关联的模块
      // let roleModuleEntity = await this.deptRepository.query(`select m.name,rm.* from t_role_module rm inner join t_module m on rm.t_module_id = m.id where rm.t_role_id IN (${ids})`);

      // if(roleModuleEntity.length > 0) {
      //    return `当前角色已有关联的资源，删除失败。`;
      // }

      // // 查询当前角色是否关联用户
      // let userRoleModal = await this.userRoleService.getUserByRoleIds(ids);
      // let name = userRoleModal.map((r=>{return r.name})).toString();
      // if (userRoleModal.length > 0) {
      //   return `角色【${name}】已关联账号，删除失败。`;
      // }
      let a = await this.productGroupRepository.delete(ids);
      Logger.log(`【批量删除品类】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除品类】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 根据商家获取全部门店信息
   * @param businessId 商家ID
   */
  async fetchProductGroup(storeId: number): Promise<any> {
    return await this.productGroupRepository.find({ where: { storeId } });
  }
}
