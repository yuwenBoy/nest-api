import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity } from 'src/entities/position.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PositionService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  /**
   * 查询职位
   * @param deptId 机构id
   * @returns 职位集合
   */
  async getPositionByDeptId(deptId: Number): Promise<any> {
    return await this.positionRepository
      .createQueryBuilder('posi')
      .select(["id AS value",'name AS label'])
      .where('posi.t_department_id=:deptId', { deptId }).getRawMany();
  }
}
