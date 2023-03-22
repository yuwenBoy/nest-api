import { Module as NESTModule } from '@nestjs/common';

import { ModuleController } from './module.controller';
import {  ModuleService } from './module.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity} from 'src/entities/admin/t_module.entity';
// 导入用户角色模块
import { UserRoleModule } from '../userRole/userRole.module';
// 导入角色模块
import { RoleModuleModule } from '../roleModule/roleModule.module';

@NESTModule({
  imports: [TypeOrmModule.forFeature([ModuleEntity]),UserRoleModule,RoleModuleModule],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports:[ModuleService]
})
export class ModuleNESTModule {}
