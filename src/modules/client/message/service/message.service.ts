import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { MessageEntity } from '../../../../entities/chat/message.entity';
import { UserEntity } from '../../../../entities/admin/t_user.entity';
import { StoreEntity } from '../../../../entities/store/store.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    private dataSource: DataSource,
  ) {}

  async getMessageList(userId: number) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC');

    const messages = await queryBuilder.getMany();

    const userIds = new Set<number>();
    messages.forEach(msg => {
      if (msg.senderId !== userId) userIds.add(msg.senderId);
      if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In([...userIds]) },
      select: ['id', 'username', 'cname', 'avatar', 'business_id']
    });

    const businessIds = users.filter(u => u.business_id).map(u => u.business_id);
    const stores = await this.dataSource.getRepository(StoreEntity).find({
      where: { business_id: In(businessIds as number[]) },
      select: ['id', 'storeName', 'business_id']
    });
    const storeMap = new Map<number, string>();
    stores.forEach(store => {
      // 如果有多个门店，优先选择默认门店
      if (!storeMap.has(store.business_id)) {
        storeMap.set(store.business_id, store.storeName);
      }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const conversationMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const user = userMap.get(otherUserId);

      if (!conversationMap.has(otherUserId)) {
        let name = user?.cname || user?.username || `用户${otherUserId}`;
        
        if (user?.business_id) {
          const storeName = storeMap.get(user.business_id);
          if (storeName) {
            name = `${storeName}`;
          }
        }

        conversationMap.set(otherUserId, {
          userId: otherUserId,
          name: name,
          avatar: user?.avatar || '',
          lastMessage: msg.content,
          lastTime: msg.createdAt.getTime(),
          unreadCount: 0,
          isBusiness: !!user?.business_id
        });
      }

      const conversation = conversationMap.get(otherUserId);
      if (msg.receiverId === userId && !msg.readAt) {
        conversation.unreadCount++;
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => b.lastTime - a.lastTime);
  }

  async getMessageHistory(userId: number, targetUserId: number, orderId?: number) {
    console.log('getMessageHistory - userId:', userId, 'targetUserId:', targetUserId, 'orderId:', orderId);
    
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId AND message.receiverId = :targetUserId) OR ' +
        '(message.senderId = :targetUserId AND message.receiverId = :userId)',
        { userId, targetUserId }
      );  

    queryBuilder.orderBy('message.createdAt', 'ASC');

    const messages = await queryBuilder.getMany();
    
    console.log('getMessageHistory - 查询到的消息数量:', messages.length);
    console.log('getMessageHistory - 查询到的消息:', messages);

    const userIds = [...new Set(messages.map(m => m.senderId))];
    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'cname', 'avatar']
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      createTime: msg.createdAt.getTime(),
      isRead: msg.readAt !== null,
      senderName: userMap.get(msg.senderId)?.cname || userMap.get(msg.senderId)?.username || '',
      senderAvatar: userMap.get(msg.senderId)?.avatar || ''
    }));
  }

  async sendMessage(messageData: any) {
    const message = this.messageRepository.create({
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      targetId: messageData.receiverId, // 目标ID：对方用户ID
      targetType: 1 // 目标类型：用户类型（1表示用户）
    });

    return await this.messageRepository.save(message);
  }

  async markAsRead(userId: number, targetUserId: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ readAt: new Date() })
      .where('receiverId = :userId', { userId })
      .andWhere('senderId = :targetUserId', { targetUserId })
      .andWhere('readAt IS NULL')
      .execute();
  }
}
