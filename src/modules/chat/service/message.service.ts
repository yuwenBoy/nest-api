import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { MessageEntity } from '../../../entities/chat/message.entity';
import { UserEntity } from '../../../entities/admin/t_user.entity';
import { MessageStatusEnum } from '../../../enum/chat_enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService {
  constructor(
    private readonly config:ConfigService,  
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    private dataSource: DataSource, // ✅ 用于复杂查询
  ) {}

  // 创建消息
  async create(messageData: Partial<MessageEntity>): Promise<MessageEntity> {
    messageData.targetId = messageData.targetId || 0; // 防止前端传null
    const message = this.messageRepository.create(messageData);
    return await this.messageRepository.save(message);
  }

  /**
   * 标记消息为已读（根据消息ID列表）
   * @param messageIds 消息ID列表
   */
  async markAsReadByMessageIds(messageIds: number[]): Promise<void> {
    console.log(`🔹 标记消息已读: messageIds=${messageIds}`);
    await this.messageRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ readAt: new Date() })
      .where('id IN (:...messageIds)', { messageIds })
      .andWhere('read_at IS NULL')
      .execute();
  }

  /**
   * 标记整个会话的消息为已读（根据目标ID和类型）
   * @param userId 当前用户ID（接收者）
   * @param targetId 目标ID（发送者）
   * @param targetType 目标类型
   */
  async markConversationRead(userId: number, targetId: number, targetType: number): Promise<void> {
    console.log(`🔹 标记会话已读: userId=${userId}, targetId=${targetId}, targetType=${targetType}`);
    await this.messageRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ readAt: new Date() })
      .where('receiver_id = :userId', { userId })
      .andWhere('sender_id = :targetId', { targetId })
      .andWhere('read_at IS NULL')
      .execute();
  }
  /**
   * 获取私聊历史（包含用户名）
   */
  async getPrivateHistory(userId1: number, userId2: number, page: number = 1) {
    console.log(
      `🔍 查询私聊历史: userId1=${userId1}, userId2=${userId2}, page=${page}`,
    );

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
    const userIds = [...new Set(messages.map((m) => m.senderId))];
    console.log(`👥 提取的发送者ID:`, userIds);

    // 4. 查询用户信息
    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'avatar', 'cname','phone','userType'], // 只选择需要的字段
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // 5. 组合结果
    const result = messages
      .map((msg) => {
        const sender = userMap.get(msg.senderId);
        let senderUsername: string;
        
        if (!sender) {
          senderUsername = `用户${msg.senderId}`;
        } else if (sender.userType === 3) {
          // 用户类型为3（顾客）：显示"用户+手机号后四位"
          const phone = sender.phone || '';
          const phoneSuffix = phone.length >= 4 ? phone.slice(-4) : phone;
          senderUsername = `用户${phoneSuffix}`;
        } else if (sender.userType === 4) {
          // 用户类型为4（骑士）：显示"骑士+name"
          senderUsername = `骑士${sender.cname || sender.username || msg.senderId}`;
        } else {
          senderUsername = sender.username || `用户${msg.senderId}`;
        }
        
        return {
          ...msg,
          senderUsername,
          senderCname: sender?.cname,
          senderAvatar: sender?.avatar || '',
          isRead: msg.readAt !== null && msg.readAt !== undefined,
        };
      })
      .reverse();
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
    const userIds = [...new Set(messages.map((m) => m.senderId))];
    // 4. 查询用户信息
    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'avatar', 'cname'], // 只选择需要的字段
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return messages
      .map((msg) => ({
        ...msg,
        senderUsername:
          userMap.get(msg.senderId)?.username || `用户${msg.senderId}`,
        isRead: msg.readAt !== null && msg.readAt !== undefined, // ✅ 添加 isRead 字段
      }))
      .reverse();
  }

  //   // 标记消息为已读
  //   async markAsRead(messageIds: number[]) {
  //     await this.messageRepository.update(messageIds, { isRead: 1 });
  //   }

  /**
   * ✅ 更新消息状态
   */
  async updateStatus(
    messageIds: number[],
    status: MessageStatusEnum,
    userId: number,
    isSender: boolean,
  ): Promise<void> {
    const updateData: any = { status };

    if (status === MessageStatusEnum.READ) {
      updateData.readAt = new Date();
    }

    const whereCondition = isSender
     ? { id: In(messageIds), senderId: userId }
      : { id: In(messageIds), receiverId: userId };
    await this.messageRepository.update(whereCondition,updateData);
  }

  /**
   * ✅ 获取消息状态（用于前端显示）
   */
  async getMessageStatus(messageId: number): Promise<MessageStatusEnum> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      select: ['status'],
    });
    return message?.status || MessageStatusEnum.SENT;
  }

  /**
   * ✅ 获取会话中消息的状态统计
   */
  async getStatusStats(
    chatType: 'private' | 'group',
    chatId: number,
    userId: number,
  ) {
    const qb = this.messageRepository.createQueryBuilder('message');

    if (chatType === 'private') {
      qb.where(
        '(message.senderId = :userId AND message.receiverId = :chatId) OR ' +
          '(message.senderId = :chatId AND message.receiverId = :userId)',
        { userId, chatId },
      );
    } else {
      qb.where('message.groupId = :groupId', { groupId: chatId });
    }

    const stats = await qb
      .select('message.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.status')
      .getRawMany();

    return stats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  /**
   * ✅ 根据ID获取单条消息（包含关联关系）
   * @param id 消息ID
   * @returns Message | null
   */
  async getMessageById(id: number): Promise<MessageEntity | null> {
    return await this.messageRepository.findOne({
      where: { id },
    //   relations: ['sender'], // 如果有User关联关系
    });
  }

  /**
   * 获取未读消息列表
   * @param userId 当前用户ID（接收者）
   * @param senderId 发送者ID
   * @returns 未读消息列表
   */
  async getUnreadMessages(userId: number, senderId: number): Promise<MessageEntity[]> {
    console.log(`🔹 getUnreadMessages - 查询未读消息: receiverId=${userId}, senderId=${senderId}`);
    const messages = await this.messageRepository.find({
      where: {
        receiverId: userId,
        senderId: senderId,
        readAt: null,
      },
    });
    console.log(`🔹 getUnreadMessages - 找到 ${messages.length} 条未读消息`);
    messages.forEach((msg, idx) => {
      console.log(`   消息${idx}: id=${msg.id}, senderId=${msg.senderId}, receiverId=${msg.receiverId}, content=${msg.content.substring(0, 20)}...`);
    });
    return messages;
  }
}
