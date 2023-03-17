import { Connection, EntitySubscriberInterface, EventSubscriber, getConnection, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { OperationLogService } from '../../security/operation.service';
import { UserEntity } from 'src/entities/t_user.entity';

@Injectable()
export class ChannelSubscriber implements EntitySubscriberInterface<UserEntity> {
// 不能注入REQUEST,只能靠單例的service收集Request而後注入到subscriber中
  constructor(connection: Connection, @Inject(OperationLogService) private service: OperationLogService) {
    connection.subscribers.push(this);
  }

  /**
   * 插入post之前调用。
   */
  beforeInsert(event: InsertEvent<UserEntity>) {
    console.log(`BEFORE POST INSERTED: `, event.entity);
  }

   /**
   * 表示此订阅者仅侦听Post事件。
   */
   listenTo() {
    console.log('121111111111111111111')
    return '121111111111111111111';
  }
 //數據更新成功後悔執行的方法.
  async afterUpdate(event: UpdateEvent<any>) {
    console.log('888888888888888888888888888888888888888888888888888888888')
     await this.service.save<any>(event);
  }
}