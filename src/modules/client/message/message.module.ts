import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../../../entities/chat/message.entity';
import { ClientMessageController } from './controller/message.controller';
import { MessageService } from './service/message.service';
import { UserModule } from '../user/user.module'; // ✅ 导入 UserModule

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), UserModule], // ✅ 添加 UserModule
  controllers: [ClientMessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
