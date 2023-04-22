import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "src/entities/shop/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  
  /**
   * 查询机构列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      console.log(
        'service层查询机构列表接受参数：' + JSON.stringify(parameter),
      );
      let queryBuilder = await this.categoryRepository.createQueryBuilder('dept');
      if (parameter.DepartmentName) {
        queryBuilder.where(
          'dept.name LIKE "%' + parameter.DepartmentName + '%"',
        );
      }
      queryBuilder.orderBy(`dept.${parameter.sort}`, 'ASC');
      queryBuilder.addOrderBy('dept.create_time','DESC');
      let data = await queryBuilder.getMany();
      let result = {
        content: parameter.DepartmentName ? data : [],
      };
      return {
        ...result
      };
    } catch (error) {
      Logger.error(`机构列表请求失败,原因：${JSON.stringify(error)}`);
    }
  }
}   