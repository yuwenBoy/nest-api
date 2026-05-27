// src/operation-log/operation-log.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLogService } from './operation-log.service';
import { OperationLogEntity } from '../entities/admin/t_operation_log.entity';
import { AuthModule } from '../modules/admin/system/auth/auth.module';
import { OperationLogController } from './operation-log.controller';

@Module({
  imports: [
     AuthModule,
    // 注册 OperationLogEntity 到 TypeOrmModule
    TypeOrmModule.forFeature([OperationLogEntity]),
  ],
  controllers:[
    OperationLogController
  ],
  providers: [
    // 提供 OperationLogService
    OperationLogService,
  ],
  exports: [
    // 导出 OperationLogService，以便其他模块可以使用
    OperationLogService,
  ],
})
export class OperationLogModule {}
