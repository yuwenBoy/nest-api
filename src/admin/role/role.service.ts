import { Injectable, Logger } from '@nestjs/common';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/t_user_role.entity';
import { Any, Brackets, Like, Repository } from 'typeorm';
import { Role } from '../../entities/t_role.entity';
import { UserRoleService } from '../userRole/userRole.service';

@Injectable()
export class RoleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly userRoleService: UserRoleService,
  ) {}

  /**
   *  角色列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      let result = {
        page: Number(parameter.page),
        size: Number(parameter.size),
        totalPage: 0,
        totalElements: 0,
        content: [],
      };

      let find_object = {
        where: [],
        order: {},
        skip: (parameter.page - 1) * Number(parameter.size), // 分页，跳过几项
        take: parameter.size, // 分页，取几项
        cache: true,
      };
      if (parameter.name) {
        find_object.where.push(
          { name:Like(`%${parameter.name}%`) },
          { code:Like(`%${parameter.name}%`) },
        );
      } else {
        delete find_object.where;
      }

      if (parameter.sort) find_object.order[parameter.sort] = 'DESC';

      result.content = await this.roleRepository.find(find_object);

      // 总条数
      result.totalElements = await this.roleRepository.count({
        where: find_object.where,
      });

      // 总页数
      result.totalPage = Math.ceil(
        (await this.roleRepository.count({ where: find_object.where })) /
          parameter.size,
      );

      return result;
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 查询用户所属的角色
   */
  async getRoleAll(userId: any): Promise<any> {
    try {
      let result = {
        roleList: [],
        checkList: [],
      };
      result.roleList = await this.roleRepository
        .createQueryBuilder('role')
        .select(['role.id value', 'role.name name'])
        .where('1=1')
        .getRawMany();

      let list = await this.userRoleService.getRoleIds(userId);
      const role_ids = list.map((item) => {
        return item.role_id;
      });
      console.log('查询用户所属的角色roleIds' + role_ids);
      if (role_ids.length > 0) {
        result.checkList = await this.roleRepository
          .createQueryBuilder('role')
          .where('role.id IN (' + role_ids.toString() + ')')
          .getMany();
        return result;
      } else {
        return result;
      }
    } catch (error) {
      Logger.error('查询全部角色失败，原因：' + error);
    }
  }

  // 设置角色

  async setRoles(parameter: any): Promise<boolean> {
    await this.userRoleService.delete(parameter);
    parameter.roles.forEach(async (item) => {
      let request = {
        id: null,
        userId: parameter.userId,
        roleId: item,
      };
      await this.userRoleService.save(request);
    });
    return true;
  }
}
