import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from 'src/gateway/chat.gateway';
import { MessageService } from './message.service';
import { MessageEntity } from 'src/entities/chat/message.entity';
import { MessageController } from './message.controller';

@Module({
  imports: [
    // 注册 TypeORM 实体
    TypeOrmModule.forFeature([MessageEntity]),
  ],
  controllers: [
    // 注册 RESTful 控制器
    MessageController,
  ],
  providers: [
    // ✨ 在这里注册 Gateway 和服务
    ChatGateway,  // WebSocket 网关
    MessageService, // 消息服务
  ],
  exports: [
    // 如果其他模块需要用到 MessageService，可以在这里导出
    MessageService,
  ],
})
export class MessageModule {}
