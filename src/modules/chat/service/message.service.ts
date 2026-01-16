import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/entities/chat/message.entity'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // 创建消息
  async create(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return await this.messageRepository.save(message);
  }

  // 获取历史消息（私聊）
  async getPrivateHistory(userId1: number, userId2: number, page: number = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    return await this.messageRepository.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  // 获取群聊历史
  async getGroupHistory(groupId: number, page: number = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    return await this.messageRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  // 标记消息为已读
  async markAsRead(messageIds: number[]) {
    await this.messageRepository.update(messageIds, { isRead: true });
  }
}
