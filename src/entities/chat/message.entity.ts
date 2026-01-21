import { Entity, Column, UpdateDateColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { MessageStatusEnum } from 'src/enum/chat_enum';
import { Transform, TransformFnParams } from 'class-transformer';
import { formatTime } from 'src/utils/date';
@Entity('message')
export class MessageEntity extends BusinessBaseEntity{
   
  @Column({ name: 'sender_id',comment:'发送者ID', nullable: true })
  senderId: number;

  @Column({ name: 'receiver_id',comment:'接收者ID', nullable: true })
  receiverId: number;

  @Column({ name: 'group_id',comment:'群组ID', nullable: true })
  groupId: number;

  @Column({ type: 'text' ,comment:'消息内容'})
  content: string;

  @Column({ name: 'message_type', comment:'消息类型', default: 'text' })
  messageType: number

  @Column({ 
    name: 'status', 
    enum: MessageStatusEnum, 
    default: MessageStatusEnum.SENT 
  })  
  status: MessageStatusEnum; // ✅ 消息状态

   @Transform((row: TransformFnParams) => {
      let timestamp: any = new Date(row.value);
      return formatTime(timestamp / 1000);
   })
  @UpdateDateColumn({name: 'read_at',comment:'读取时间'})
  readAt: Date;
}
