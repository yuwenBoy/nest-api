import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessCategoryEntity } from 'src/entities/business/category.entity';
import { AuthModule } from '../system/auth/auth.module';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
import { BusinessController } from './controller/business.controller';
import { BusinessService } from './service/business.service';
import { BusinessEntity } from 'src/entities/business/business.entity';
import { BusinessCategoryRelationEntity } from 'src/entities/business/business_category_relation.entity';
import { EmailService } from 'src/modules/common/services/email/email.service';
import { BusinessAccountEntity } from 'src/entities/business/business_account.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { AccountController } from './controller/account.controller';
import { AccountService } from './service/account.service';
import { HoursService } from './service/hours.service';
import { HoursController } from './controller/hours.controller';
import { StoreEntity } from 'src/entities/store/store.entity';
import { EmployeeEntity } from 'src/entities/store/employee.entity';
import { StoreController } from './controller/store.controller';
import { StoreService } from './service/store.service';
import { EmployeeController } from './controller/employee.controller';
import { EmployeeService } from './service/employee.service';
import { RoleEntity } from 'src/entities/admin/t_role.entity';
import { StoreHoursEntity } from 'src/entities/store/store_hours.entity';
import { StoreDeliveryAreaEntity } from 'src/entities/store/store_deliveryarea.entity';
import { AuditLogEntity } from 'src/entities/business/audit_log.entity';
import { AuditLogController } from './controller/auditLog.controller';
import { AuditLogService } from './service/auditLog.service';
import { StoreQualificationEntity } from 'src/entities/store/store_qualification.entity';

/**
 * 商家管理模块
 * @deprecated BusinessAuditEntity 已废弃，请使用 AuditLogEntity 进行审核记录管理
 */
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: '', module: BusinessModule, }]),
    TypeOrmModule.forFeature([
        BusinessCategoryEntity, // 商家分类表
        BusinessEntity,// 商家表
        BusinessAccountEntity, // 商家账户信息表（用于存储商家收款账户）
        // BusinessAuditEntity, // 已废弃，使用 AuditLogEntity 替代
        BusinessCategoryRelationEntity, // 商家分类关联表
        StoreHoursEntity, // 门店营业时间表
        StoreDeliveryAreaEntity, // 商家配送表
        UserEntity,
        StoreEntity, // 门店表
        StoreQualificationEntity, // 门店资质表
        EmployeeEntity, // 员工表
        RoleEntity,
        AuditLogEntity, // 审核日志表
    ]),
  ],
  controllers: [
    CategoryController,
    BusinessController,
    AccountController,
    HoursController,
    StoreController,
    EmployeeController,
    AuditLogController,
  ],
  providers: [
    CategoryService,
    BusinessService,
    EmailService,
    AccountService,
    HoursService,
    StoreService,
    EmployeeService,
    AuditLogService,
  ],
})
export class BusinessModule {}



/*****
 * 临时记录一下系统需要做的功能
 * 1.商品管理
 * 2.库存管理
 * 3.商品分类
 * 4.促销设置
 * 
 * 1.订单管理
 *    1.1 查看订单
 *    1.2 处理订单
 *    1.3 订单核销
 *    1.4 订单统计
 * 
 * 
 * 财务管理
 *   收入统计
 *   提现申请
 *   账单管理
 * 
 * 客户服务
 *    客户咨询
 *    评价管理
 *    售后服务
 * 
 * 
 * 数据分析
 *   流量分析
 *   销售分析
 *   用户行为分析
 * 
 * 营销推广
 *    促销活动
 *    广告投放
 *    会员管理
 * 
 * 店铺设置
 *   店铺信息
 *   店铺模板
 *   支付方式
 *   配送方式
 * 
 * 权限管理
 *    商家可以管理后台用户的权限
 *    用户角色：设置不同角色的权限（如管理员、运营人员等）    
 *    用户管理：添加或删除后台用户
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
