import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { OperationLog } from '../entities/security/operation.entity';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
@Injectable()
export class OperationLogService extends TypeOrmCrudService<OperationLog> {
  public context: ExecutionContext;
  constructor(private readonly reflector: Reflector, @InjectRepository(OperationLog) repo) {
    super(repo);
  }
  async save<T extends { id: string | number }>(event: UpdateEvent<T> & RemoveEvent<T> & InsertEvent<T>) {
    const handler = this.context.getHandler();
    const operator = this.context.switchToHttp().getRequest().user.username; //从request上得到user信息
    const operation = this.reflector.get('operation', handler);  //得到方法上的注解
    const { entity, databaseEntity } = event;

    console.log('this.content'+this.context);
    console.log('888888888888888888888888888888888888888888888888888888888')
    const data = {
      operator,
      oldEntity: databaseEntity,
      newEntity: entity,
      method: handler.name,
      operation: operation,
      entityId: String(entity.id),
      entity: event.metadata.tableName,
    };
    
    //判断是否有更新及是否须要记录日志
    if (event.updatedColumns.length > 0 && operation) {
      await this.repo.save(data);
    }
  }
}