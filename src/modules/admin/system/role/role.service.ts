import { Injectable, Logger } from '@nestjs/common';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Any, Brackets, Like, Repository } from 'typeorm';
import { RoleEntity } from 'src/entities/admin/t_role.entity';
import { UserRoleService } from '../userRole/userRole.service';
import { PageEnum } from 'src/enum/page.enum';

@Injectable()
export class RoleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
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
        page: PageEnum.PAGE_NUMBER,
        size: PageEnum.PAGE_SIZE,
        totalPage: 0,
        totalElements: 0,
        content: [],
      };

      let find_object = {
        where: [],
        order: {},
        skip: (parameter.page - 1) * Number(parameter.size), // 分页，跳过几项
        take: parameter.size, // 分页，取几项
        cache: false,
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

  
  /**
   * 新增|编辑 角色
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any,userName:string): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        const { name } = parameter;
        const existUser = await this.roleRepository.exist({
          where: { name },
        });
        if (existUser) {
          return '角色已存在';
        }
        parameter.create_by = userName;
      }else{
        parameter.update_by = userName;
      }
      // 必须用save 更新时间才生效
      let res = await this.roleRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】角色请求失败：${JSON.stringify(error)}`);
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
    
      // 查询角色是否有关联的模块
      let roleModuleEntity = await this.roleRepository.query(`select m.name,rm.* from t_role_module rm inner join t_module m on rm.t_module_id = m.id where rm.t_role_id IN (${ids})`);

      if(roleModuleEntity.length > 0) {
         return `当前角色已有关联的资源，删除失败。`;
      }

      // 查询当前角色是否关联用户
      let userRoleModal = await this.userRoleService.getUserByRoleIds(ids);
      let name = userRoleModal.map((r=>{return r.name})).toString();
      if (userRoleModal.length > 0) {
        return `角色【${name}】已关联账号，删除失败。`;
      }
      let a = await this.roleRepository.delete(ids);
      Logger.log(`【批量删除角色】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除角色】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}
