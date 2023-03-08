import { Injectable, Logger } from '@nestjs/common';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { DeptEntity } from 'src/entities/dept.entity';
import { PositionEntity } from 'src/entities/position.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/t_user.entity';
import { loginParamDto } from './dto/user.dto';

@Injectable()
export class UserService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   *
   * @param data 用户名、密码
   * 用户登录
   * @returns
   */
  login(data: loginParamDto) {
    const result = [];
    if (data) {
      let res = this.userRepository.query(`select * from t_user`);
      console.log(res);
      return res;
    } else {
      return [];
    }
  }


 /**
  * 用户列表
  * @param parameter 查询条件
  * @returns list
  */
  async pageQuery(parameter:any):Promise<any> {
      let result = {
        page:Number(parameter.page),
        size:Number(parameter.size),
        totalPage: 0,
        totalElements:0,
        content:[]
      };

      // 返回条数
    let SQLwhere: any = {};
    if (parameter.name != undefined) {
      SQLwhere.name = parameter.name;
    }

    // let build_sql = ` select te.department_name dept_name,
    // po.name position_name,
    // us.* from t_user us join t_department te on us.dept_id = te.id join t_position po on us.position_id = po.id`
    // result.content = await this.userRepository.query(build_sql);

    result.content = await this.userRepository.createQueryBuilder("user")
                    // .innerJoin("user.dept_id","dept")
                    .leftJoinAndMapOne('user.dept_id',DeptEntity,'dept','user.dept_id=dept.id')
                    .innerJoinAndMapOne('user.position_id',PositionEntity,'posi','user.position_id=posi.id')
                  
                    // .orWhere("user.cname like :name", {cname: '%' + parameter.cname + '%' })
                    // .orWhere("user.phone like :phone", {phone: '%' + parameter.cname + '%' })
                    // .orWhere("user.email like :email", {email: '%' + parameter.cname + '%' })
                    // .where("user.isdisabled=:isdisabled",{isdisabled: parameter.isdisabled})
                    // .where("user.dept_id=:dept_id",{dept_id: parameter.deptId})
                    .skip((parameter.page - 1) * Number(parameter.size))
                    .take(parameter.size)
                    .printSql()
                    .getMany()

    // result.content = await this.userRepository.find({
    //   where: SQLwhere,
    //   order: {
    //     id: 'DESC',
    //   },
    //   skip: (parameter.page - 1) * Number(parameter.size), // 分页，跳过几项
    //   take: parameter.size, // 分页，取几项
    //   cache: true
    // });

    // 总条数
    result.totalElements = await this.userRepository.count();

    // 总页数
    result.totalPage = Math.ceil(
      (await this.userRepository.count()) / parameter.size,
    );

    return result;

  }
   // 增加/更新
   async save(parameter: any): Promise<boolean> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      let a = await this.userRepository.save(parameter);
      return true;
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  // 删除
  async delete(ids: any): Promise<boolean> {
    Logger.log(`请求参数：${JSON.stringify(ids)}`);
    try {
      let a = await this.userRepository.delete(ids.id);
      Logger.log(`删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
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
