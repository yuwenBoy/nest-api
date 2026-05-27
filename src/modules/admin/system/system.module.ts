import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from '../../../entities/admin/dept.entity';
import { PositionEntity } from '../../../entities/admin/position.entity';
import { ModuleEntity } from '../../../entities/admin/t_module.entity';
import { RoleEntity } from '../../../entities/admin/t_role.entity';
import { RoleModuleEntity } from '../../../entities/admin/t_role_module.entity';
import { UserEntity } from '../../../entities/admin/t_user.entity';
import { UserRoleEntity } from '../../../entities/admin/t_user_role.entity';
import { RoleController } from './controller/role.controller';
import { UserController } from './controller/user.controller';
import { DeptController } from './controller/dept.controller';
import { DeptService } from './service/dept.service';
import { ModuleService } from './service/module.service';
import { PositionController } from './controller/position.controller';
import { PositionService } from './service/position.service';
import { RoleModuleController } from './controller/roleModule.controller';
import { RoleModuleService } from './service/roleModule.service';
import { RoleService } from './service/role.service';
import { UserService } from './service/user.service';
import { UserRoleService } from './service/userRole.service';
import { ModuleController } from './controller/module.controller';
import { OssController } from './controller/oss.controller';
import { OssService } from './service/oss.service';
import { QiniuService } from './service/qiniu.service';
import { AuthModule } from './auth/auth.module';
import { DynamicAttributeEntity } from '../../../entities/admin/dynamic_attribute.entity';
import { dynamicAttributeController } from './controller/dynamicAttribute.controller';
import { DynamicAttributeService } from './service/dynamicAttribute.service';
import { dynamicAttributeValueController } from './controller/dynamicAttributeValue.controller';
import { DynamicAttributeValueService } from './service/dynamicAttributeValue.service';
import { DynamicAttributeValueEntity } from '../../../entities/admin/dynamic_attribute_value.entity';
import { productCategoryDynamicAttributeRelationEntity } from '../../../entities/admin/product_category_dynamic_attribute_relation.entity';
import { ProductDynamicAttributeEntity } from '../../../entities/product/product_dynamic_attribute.entity';
/**
 * 系统管理模块
 */
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: '', module: SystemModule }]),
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      RoleEntity,
      RoleModuleEntity,
      ModuleEntity,
      PositionEntity,
      DeptEntity,
      DynamicAttributeEntity,
      DynamicAttributeValueEntity,
      ProductDynamicAttributeEntity,
      productCategoryDynamicAttributeRelationEntity,
    ]),
  ],
  controllers: [
    UserController,
    RoleController,
    PositionController,
    DeptController,
    RoleModuleController,
    ModuleController,
    OssController,
    dynamicAttributeController,
    dynamicAttributeValueController,
  ],
  providers: [
    UserService,
    RoleService,
    UserRoleService,
    RoleModuleService,
    PositionService,
    DeptService,
    ModuleService,
    OssService,
    QiniuService,
    DynamicAttributeService,
    DynamicAttributeValueService,
  ],
})
export class SystemModule {}
