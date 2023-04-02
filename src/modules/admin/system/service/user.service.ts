import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeptEntity } from 'src/entities/admin/dept.entity';
import { PositionEntity } from 'src/entities/admin/position.entity';
import { Brackets, getConnection, Repository } from 'typeorm';
import { UserRoleService } from './userRole.service';
import { compareSync, hashSync } from 'bcryptjs';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { PageListVo } from 'src/modules/common/page/pageList';
import { DisabledDto } from '../dto/user/disabled.dto';
import { UpdateUserPwdDto } from '../dto/user/updateUserPwd.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 查询用户分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndMapOne(
          'user.dept_id',
          DeptEntity,
          'dept',
          'user.dept_id=dept.id',
        )
        .innerJoinAndMapOne(
          'user.position_id',
          PositionEntity,
          'posi',
          'user.position_id=posi.id',
        )
        .where(
          new Brackets((qb) => {
            if (parameter.cname) {
              return qb.where(
                'user.cname LIKE :cname or user.phone LIKE :phone or user.email LIKE :email',
                {
                  cname: `%${parameter.cname}%`,
                  phone: `%${parameter.cname}%`,
                  email: `%${parameter.cname}%`,
                },
              );
            } else {
              return qb;
            }
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            if (parameter.disabled) {
              return qb.andWhere('user.disabled=:disabled', {
                disabled: parameter.disabled,
              });
            } else {
              return qb;
            }
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            if (parameter.deptId) {
              return qb.andWhere('user.dept_id=:deptId', {
                deptId: parameter.deptId,
              });
            } else {
              return qb;
            }
          }),
        )
        .orderBy(`user.${parameter.sort}`, 'DESC')
        .addOrderBy('user.create_time', 'DESC')
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
      Logger.error(`查询用户分页列表失败，原因：${JSON.stringify(error)}`);
    }
  }

  /**
   * 设置用户状态
   * @param parameter id、disabled
   * @param updateBy 更新人
   * @returns 设置成功与失败
   */
  async updateDisabledById(
    parameter: DisabledDto,
    updateBy: string,
  ): Promise<any> {
    Logger.log(
      `用户管理服务层【updateDisabledById】方法接受参数：${JSON.stringify(
        parameter,
      )}`,
    );
    try {
      if (parameter.id <= 0) {
        return '参数错误，请检查。';
      } else {
        if (parameter.disabled > 0) {
          let result = await this.userRepository
            .createQueryBuilder()
            .update(UserEntity)
            .set({ disabled: parameter.disabled, update_by: updateBy })
            .where('id = :id', { id: parameter.id })
            .execute();
          return result.affected == 1 ? true : false;
        } else {
          return '参数错误，请检查。';
        }
      }
    } catch (error) {
      Logger.error(`用户状态设置失败，原因：${JSON.stringify(error)}`);
      return '用户状态设置失败，原因' + error;
    }
  }

  /**
   * 修改密码
   * @param parameter oldPassword new Password
   * @param 当前用户
   * @returns 修改成功与失败
   */
  async updateUserPwd(
    parameter: UpdateUserPwdDto,
    userInfo: any,
  ): Promise<any> {
    Logger.log(
      `用户管理服务层【updateUserPwd】方法接受参数：${JSON.stringify(
        parameter,
      )}`,
    );
    try {
      if (userInfo.id > 0) {
        let user = await this.userRepository.findOne({where:{id:userInfo.id}});
        if (user) {
          if (compareSync(parameter.oldPassword, user.password)) {
            let transformPass = hashSync(parameter.newPassword, 11)
            let result = await this.userRepository
              .createQueryBuilder()
              .update(UserEntity)
              .set({
                password: transformPass,
                update_by: user.username,
              })
              .where('id = :id', { id: user.id })
              .execute();
            return result.affected ? true : false;
          } else {
            return '旧密码错误，请重新输入。';
          }
          // 1.验证旧密码是否正确
          // 2.修改密码
        } else {
          // 用户不存在；
          return '当前用户不存在，修改密码失败。';
        }
      }
    } catch (error) {
      Logger.error(`修改密码失败，原因：${JSON.stringify(error)}`);
      return '修改密码失败，原因' + error;
    }
  }

  /**
   * 新增|编辑 用户
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any, userName: string): Promise<any> {
    Logger.log(
      `用户管理服务层【save】方法接受参数:${JSON.stringify(parameter)}`,
    );
    try {
      if (!parameter.id) {
        const { username } = parameter;
        const existUser = await this.userRepository.exist({
          where: { username },
        });
        if (existUser) {
          return '用户账号已存在';
        }
        parameter.create_by = userName;
      } else {
        parameter.update_by = userName;
      }
      const password = this.config.get<string>('user.initialPassword');
      const transformPass = hashSync(password, 11);
      parameter.password = transformPass;
      // 必须用save 更新时间才生效
      let res = await this.userRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return `${parameter.id > 0 ? '修改' : '新增'}用户失败，原因：`;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】用户请求失败：${JSON.stringify(error)}`);
      return `${parameter.id > 0 ? '修改' : '新增'}用户失败，原因：` + error;
    }
  }

  /**
   * 批量删除用户
   * @param ids 用户id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    Logger.log(`【批量删除用户】请求参数：${JSON.stringify(ids)}`);
    try {
      let userRoleModal = await this.userRoleService.getRoleIdsByUserIds(ids);
      let username = userRoleModal
        .map((r) => {
          return r.username;
        })
        .toString();
      if (userRoleModal.length > 0) {
        return `账号【${username}】已关联角色，删除失败。`;
      }
      let a = await this.userRepository.delete(ids);
      Logger.log(`【批量删除用户】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除用户】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 根据用户名获取用户信息
   * @param account 用户名
   * @returns 返回单个用户信息
   */
  async getUserAccout(account: string): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.username=:username', { username: account })
      .getOne();
  }

  /**
   * 根据用户id获取用户
   * @param userId 用户id
   */
  async getUserById(userId: string | number): Promise<any> {
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndMapOne(
        'user.dept_id',
        DeptEntity,
        'dept',
        'user.dept_id=dept.id',
      )
      .innerJoinAndMapOne(
        'user.position_id',
        PositionEntity,
        'posi',
        'user.position_id=posi.id',
      )
      .where('user.id = :userId')
      .setParameter('userId', userId)
      .getOne();
  }
}
