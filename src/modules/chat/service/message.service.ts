import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource, In } from 'typeorm';
import { MessageEntity } from 'src/entities/chat/message.entity'
import { UserEntity } from 'src/entities/admin/t_user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    private dataSource: DataSource, // ✅ 用于复杂查询
  ) {}

  // 创建消息
  async create(messageData: Partial<MessageEntity>): Promise<MessageEntity> {
    const message = this.messageRepository.create(messageData);
    return await this.messageRepository.save(message);
  }
  /**
   * 获取私聊历史（包含用户名）
   */
  async getPrivateHistory(userId1: number, userId2: number, page: number = 1) {
    console.log(`🔍 查询私聊历史: userId1=${userId1}, userId2=${userId2}, page=${page}`);

    const take = 20;
    const skip = (page - 1) * take;

    // 1. 先查询消息
    const messages = await this.messageRepository.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    console.log(`📦 查询结果: 找到 ${messages.length} 条消息`);

    // 2. 如果消息为空，直接返回空数组
    if (messages.length === 0) {
      console.warn('⚠️ 没有找到任何消息，返回空数组');
      return [];
    }

    // 3. 提取所有发送者ID（去重）
    const userIds = [...new Set(messages.map(m => m.senderId))];
    console.log(`👥 提取的发送者ID:`, userIds);

    // 4. 查询用户信息
    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'avatar','cname'], // 只选择需要的字段
    });

    console.log(`👤 查询到的用户:`, users);

    const userMap = new Map(users.map(u => [u.id, u]));

    // 5. 组合结果
    const result = messages.map(msg => ({
      ...msg,
      senderUsername: userMap.get(msg.senderId)?.username || `用户${msg.senderId}`,
      senderCname: userMap.get(msg.senderId)?.cname,
      senderAvatar: userMap.get(msg.senderId)?.avatar,
    })).reverse();

    console.log(`✅ 最终结果:`, result);
    return result;
  }

  /**
   * 获取群聊历史（包含用户名）
   */
  async getGroupHistory(groupId: number, page: number = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    const messages = await this.dataSource
      .getRepository(MessageEntity)
      .createQueryBuilder('message')
      .where('message.groupId = :groupId', { groupId })
      .orderBy('message.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getMany();

    // ✅ 获取用户信息
    const userIds = [...new Set(messages.map(m => m.senderId))];
   // 4. 查询用户信息
    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'avatar','cname'], // 只选择需要的字段
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return messages.map(msg => ({
      ...msg,
      senderUsername: userMap.get(msg.senderId)?.username || `用户${msg.senderId}`,
    })).reverse();
  }

  // 标记消息为已读
  async markAsRead(messageIds: number[]) {
    await this.messageRepository.update(messageIds, { isRead: 1 });
  }
}
