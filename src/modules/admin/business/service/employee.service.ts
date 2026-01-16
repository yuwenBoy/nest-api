import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, getConnection, getRepository, In, Repository } from 'typeorm';
import { PageListVo } from 'src/modules/common/page/pageList';
import { StoreEntity } from 'src/entities/store/store.entity';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { EmployeeEntity } from 'src/entities/store/employee.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { RoleEntity } from 'src/entities/admin/t_role.entity';
import { compareSync, hashSync } from 'bcryptjs';
import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';
import { ConfigService } from '@nestjs/config';
import { UserTypeEnum } from 'src/enum/admin_enum';
import { UserInfoDto } from '../../system/dto/user/userInfo.dto';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(EmployeeEntity)
        private employeeRepository: Repository<EmployeeEntity>,
        @InjectRepository(RoleEntity)
        private roleRepository: Repository<RoleEntity>,
        private readonly config: ConfigService,

        // @InjectRepository(StoreEntity)
        // private storeRepository: Repository<StoreEntity>,
      ) {}
      
      /**
         * 查询分页列表
         * @param parameter 查询条件
         * @returns list
         */
      async pageQuery(parameter: any,store_id:number): Promise<PageListVo> {
        try {
         const [pageIndex, pageSize] = [parameter.page, parameter.size];
              let qb = await this.employeeRepository
                .createQueryBuilder('employee')
                .innerJoinAndMapOne(
                  'employee.store',
                  StoreEntity,
                  'store',
                  'employee.store_id=store.id',
                ) .innerJoinAndMapOne(
                    'employee.user',
                    UserEntity,
                    'user',
                    'employee.user_id=user.id',
                  ).where(
                  new Brackets((qb) => {
                    // if (store_id) {
                    //     qb.andWhere('store.id = :store_id', { store_id });
                    //   }
                      if (parameter.storeName) {
                        qb.andWhere('store.store_name LIKE :storeName', {
                            storeName: `%${parameter.storeName}%`,
                        });
                      }
                      if (parameter.contactInfo) {
                        qb.andWhere('store.contact_info LIKE :contactInfo', {
                            contactInfo: `%${parameter.contactInfo}%`,
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
          throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }


  // 新增
   async create(employeeData: Partial<any>,userInfo:UserInfoDto): Promise<EmployeeEntity> {
    return this.employeeRepository.manager.transaction(async (entityManager) => {

        const password = this.config.get<string>('user.initialPassword');
        const transformPass = hashSync(password, 11);
        // Step 1: Create a new user record
        const newUser = entityManager.create(UserEntity, {
          username: employeeData.username,
          cname:employeeData.cname,
          userType:UserTypeEnum.STOREUSER, // 门店用户
          password:transformPass,
          email: employeeData.email,
          dept_id:employeeData.deptId.id,
          position_id:employeeData.positionId.id,
          phone:employeeData.phone,
          nick_name:employeeData.nick_name,
          sex:employeeData.sex,
          birthday:employeeData.birthday,
          business_id:userInfo.business_id,
          create_by:userInfo.username,
          update_by:userInfo.username,
        });
        const savedUser = await entityManager.save(newUser);
  
        // Step 2: Create a new employee record and link it to the user and store
        const newEmployee = entityManager.create(EmployeeEntity, {
          ...employeeData,
          store_id:employeeData.store.id,
          user: savedUser,
        });
        const savedEmployee = await entityManager.save(newEmployee);
  
        // Step 3: Assign roles to the user
        // const roles = await this.roleRepository.findByIds(roleIds);
        // if (roles.length !== roleIds.length) {
        //   throw new NotFoundException(`One or more roles not found`);
        // }

        // const roles = [{id:'48'}] // 默认饿了么（门店端）角色
  
        // const userRoles = roles.map(role => entityManager.create(UserRoleEntity, {
        //   userId: savedUser.id,
        //   roleId:role.id,
        // }));
        // await entityManager.save(userRoles);
  
        return savedEmployee;
      });    
    }

    // async updateEmployee(employeeData: Partial<EmployeeEntity>, roleIds: number[]): Promise<EmployeeEntity> {
    //     return this.employeeRepository.manager.transaction(async (entityManager) => {
    //       // Step 1: Find the existing employee
    //       const employee = await this.employeeRepository.findOne({ where: {id:employeeData.id }, relations: ['user', 'store'] });
    //       if (!employee) {
    //         throw new NotFoundException(`Employee with ID ${employeeData.id} not found`);
    //       }
    
    //       // Step 2: Update employee information
    //       employee.status = employeeData.status || employee.status;
    //       employee.store = employeeData.store_id ? await this.storeRepository.findOne(employeeData.store_id) : employee.store;
    //       await entityManager.save(employee);
    
    //       // Step 3: Update user information
    //       employee.user.username = employeeData.username || employee.user.username;
    //       employee.user.email = employeeData.email || employee.user.email;
    //       await entityManager.save(employee.user);
    
    //       // Step 4: Update roles
    //       const roles = await this.roleRepository.findByIds(roleIds);
    //       if (roles.length !== roleIds.length) {
    //         throw new NotFoundException(`One or more roles not found`);
    //       }
    
    //       // Remove existing roles
    //       await this.userRoleRepository.delete({ user: employee.user });
    
    //       // Assign new roles
    //       const userRoles = roles.map(role => entityManager.create(UserRole, {
    //         user: employee.user,
    //         role,
    //       }));
    //       await entityManager.save(userRoles);
    
    //       return employee;
    //     });
    //   }
}
