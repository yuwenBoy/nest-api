import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeptEntity } from 'src/entities/dept.entity';
import { PositionEntity } from 'src/entities/position.entity';
import { Brackets, Repository } from 'typeorm';
import { UserEntity } from '../../entities/t_user.entity';

@Injectable()
export class UserService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 用户列表
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
      result.content = await this.userRepository
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
        .skip((parameter.page - 1) * Number(parameter.size))
        .take(parameter.size)
        .getMany();

      // 总条数
      result.totalElements = await this.userRepository
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
        .getCount();

      // 总页数
      result.totalPage = Math.ceil(result.totalElements / parameter.size);

      return result;
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
  // 增加/更新
  async save(parameter: any): Promise<boolean> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        // parameter.create_time = moment().format();
        let res = await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(UserEntity)
          .values([parameter])
          .execute();
        if (res.raw) {
          console.log(res.raw)
          return true;
        } else {
          return false;
        }
      } else {
        // console.log("===========moment().format();",moment().format())
        // parameter.update_time = moment().format();
        let res = await this.userRepository.update(parameter.id,parameter)
          // .createQueryBuilder()
          // .update(UserEntity)
          // .set(parameter)
          // .where('id = :id', { id: parameter.id })
          // .execute();s
          if (res.raw) {
            return true;
          } else {
            return false;
          }
      }
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  // 删除
  async delete(ids: any): Promise<boolean> {
    Logger.log(`请求参数：${JSON.stringify(ids)}`);
    try {
      let a = await this.userRepository.delete(ids);
      Logger.log(`删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
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
      .addSelect('user.password')
      .where('user.username=:username', { username: account })
      .getOne();
  }

  /**
   * 根据用户id获取用户
   * @param userId 用户id
   */
  async getUserById(userId: string | number): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: userId })
      .getOne();
  }
}
