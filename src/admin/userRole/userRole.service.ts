import { Injectable } from '@nestjs/common';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../entities/t_user_role.entity';

@Injectable()
export class UserRoleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

    /**
   * 根据用户id获取用户角色
   * @param account 用户id
   * @returns 返回角色list
   */
    async getRoleIds(userId: Number) : Promise<any> {
        let result =  await this.userRoleRepository
        .createQueryBuilder('userRole')
        .select('userRole.role_id')
        .where('userRole.user_id = :userId',{userId:userId}).getRawMany();
        console.log('==========='+JSON.stringify(result));
        return result;
     }


      // return await this.userRoleRepository
      // .createQueryBuilder('userRole')
      // .select('userRole.role_id')
      // .where('userRole.user_id=:userId', { userId: userId }).getRawMany()

     getRoleModules(roleIds:Array<any>):Promise<any> {
      console.log('roleIds================='+roleIds.toString());
      
      return;
    }
}
