import { AuthService } from './../modules/admin/system/service/auth.service';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageService } from '../modules/chat/service/message.service';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { DataSource } from 'typeorm';
import { MessageStatusEnum } from 'src/enum/chat_enum';

// 用户状态枚举
export enum UserStatusEnum {
  ONLINE = 'online',    // 在线
  BUSY = 'busy',        // 忙碌
  OFFLINE = 'offline',  // 关闭/离线
}

/**
 * WebSocket 聊天模块
 */
@WebSocketGateway({
  namespace: '/chat', // 命名空间必须与前端一致
  path: '/socket.io',
  cors: {
    origin: '*', // Vue 开发服务器地址
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  // 在线用户状态管理: key = userId, value = { socketId, status }
  private onlineUsers: Map<number, { socketId: string; status: UserStatusEnum }> = new Map();

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private dataSource: DataSource, // ✅ 用于复杂查询
  ) {}
  /**
   *
   * @param client 客户端连接
   * @returns
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log('🔌 客户端连接:', client.id);
      this.logger.log('🔌 客户端 IP:', client.request.connection.remoteAddress);
      this.logger.log('时间：', new Date().toISOString());

      // 1. 验证 token
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.error('WebSocket 未提供认证token!');
        client.emit('error', { message: '未提供认证token' });
        // 关闭连接
        client.disconnect(true);
        return;
      }
      let userInfo;
      try {
        this.logger.log('开始验证Token...');

        userInfo = this.AuthService.verifyToken(token);

        this.logger.log('Token 验证成功！', JSON.stringify(userInfo));
      } catch (error) {
        this.logger.error('WebSocket 认证失败');

        client.emit('error', { message: 'WebSocket 认证失败' });

        // 关闭连接
        client.disconnect(true);
        return;
      }

      // 加入房间
      const roomName = `user_${userInfo.id}`;

      this.logger.log('准备加入房间：' + roomName);
      await client.join(roomName);
      this.logger.log('成功加入房间：' + roomName);

      //    // 立即检查房间状态
      //    const rooms = this.server.sockets.adapter.rooms;
      //    const room = rooms.get(roomName);
      //    console.log(`立即检查 - 房间 ${roomName} 中有 ${room?.size || 0 } 个客户端`)

      //    // 延迟1秒检查房间状态
      //    setTimeout(() => {
      //      const socketsInRoom = rooms.get(roomName);
      //      console.log(`延迟1秒检查 - 房间 ${roomName} 中有 ${socketsInRoom?.size || 0 } 个客户端`)
      //    }, 1000);

      client.data.userId = userInfo.id; // 将用户ID挂载到socket
      //    client.data.username = userInfo.username; // 将用户名挂载到socket
      
      // 添加到在线用户列表，初始状态为在线
      this.onlineUsers.set(userInfo.id, { socketId: client.id, status: UserStatusEnum.ONLINE });
      this.logger.log(`用户 ${userInfo.id} 上线，状态: ${UserStatusEnum.ONLINE}，当前在线用户数: ${this.onlineUsers.size}`);
      
      // 广播用户上线状态
      this.broadcastUserStatus(userInfo.id, UserStatusEnum.ONLINE);
      
      // 4. 发送欢迎消息
      client.emit('connected', {
        message: 'WebSocket 连接成功！',
        userId: userInfo.id,
        status: UserStatusEnum.ONLINE,
      });
    } catch (error) {
      this.logger.error('WebSocket 认证失败');
      client.disconnect();
    }
  }
 
  /**
   *
   * @param client
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userInfo = this.onlineUsers.get(userId);
      if (userInfo) {
        this.onlineUsers.delete(userId);
        this.logger.log(`用户 ${userId} 下线，当前在线用户数: ${this.onlineUsers.size}`);
        // 广播用户下线状态
        this.broadcastUserStatus(userId, UserStatusEnum.OFFLINE);
      }
    }
    this.logger.log(`客户端断开连接: ${client.id}`);
  }

  // 监听私聊消息
  @SubscribeMessage('private_message')
  async handlePrivateMessage(client: Socket, payload: any) {
    const { receiverId, content, targetId, targetType } = payload;
    const senderId = client.data.userId;
    // 1. 保存消息
    const message = await this.messageService.create({
      senderId,
      receiverId,
      content,
      targetId,
      targetType,
    });

    // 2. 查询发送者信息（用于显示）
    const sender = await this.dataSource.getRepository(UserEntity).findOne({
      where: { id: senderId },
      select: ['id', 'username', 'avatar', 'cname'],
    });

    // 检查接收者状态
    const receiverStatus = this.getUserStatus(receiverId);
    
    const messageWithUser = {
      ...message,
      senderUsername: sender?.username || `用户${senderId}`,
      senderCname: sender?.cname,
      senderAvatar: sender?.avatar,
      receiverStatus, // 包含接收者状态
    };

    // 3. ✅ 广播给接收者（关键：发送给接收者的房间）
    const receiverRoom = `user_${receiverId}`;

    this.logger.log('📨 正在广播到房间:', receiverRoom);

    // 广播给接收者
    this.server.to(receiverRoom).emit('new_message', messageWithUser);

    let updatePayload = {
      senderId: message.senderId,
      targetId: message.targetId,
      lastMessage: message.content,
      lastTime: message.createdAt,
    };
    // ✅ 推送给发送方，更新他的会话列表
    client.emit('message_update', updatePayload);

    // ✅ 打印广播结果
    const socketsInRoom = await this.server.in(receiverRoom).fetchSockets();

    this.logger.log(
      `🏠 房间 ${receiverRoom} 中有 ${socketsInRoom.length} 个客户端`,
    );

    // 4. ✅ 也发送给发送者（用于确认，显示"已发送"状态）
    client.emit('message_sent', messageWithUser);

    console.log(`✅ 消息已发送给 ${receiverId}`);
  }

  // 监听群聊消息
  @SubscribeMessage('group_message')
  async handleGroupMessage(client: Socket, payload: any) {
    const { groupId, content } = payload;
    const senderId = client.data.userId;

    const message = await this.messageService.create({
      senderId,
      groupId,
      content,
    });

    // 广播给群组内所有成员
    this.server.to(`group_${groupId}`).emit('new_message', message);
  }

  // 用户加入房间（用于群聊）
  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.logger.log(`用户 ${client.data.userId} 加入房间 ${roomId}`);
  }

  @SubscribeMessage('mark_as_delivered')
  async handleMarkAsDelivered(
    client: Socket,
    payload: { messageIds: number[] },
  ) {
    const userId = client.data.userId;

    console.log('📦 标记消息为已送达:', {
      userId,
      messageIds: payload.messageIds,
    });

    // 更新数据库
    await this.messageService.updateStatus(
      payload.messageIds,
      MessageStatusEnum.DELIVERED,
      userId,
      true,
    );

    // ✅ 通知发送者消息已送达
    payload.messageIds.forEach(async (messageId) => {
      const message = await this.messageService.getMessageById(messageId);
      if (message) {
        const senderRoom = `user_${message.senderId}`;
        this.server.to(senderRoom).emit('message_status_updated', {
          messageId: message.id,
          status: MessageStatusEnum.DELIVERED,
          updatedAt: new Date(),
        });
      }
    });
  }

  // ✅ 标记消息为已读
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(client: Socket, payload: { messageIds: number[] }) {
    const userId = client.data.userId;

    console.log('📖 标记消息为已读:', {
      userId,
      messageIds: payload.messageIds,
    });

    // 更新数据库
    await this.messageService.updateStatus(
      payload.messageIds,
      MessageStatusEnum.READ,
      userId,
      false,
    );

    // ✅ 通知发送者消息已读
    payload.messageIds.forEach(async (messageId) => {
      const message = await this.messageService.getMessageById(messageId);
      if (message) {
        const senderRoom = `user_${message.senderId}`;
        this.server.to(senderRoom).emit('message_status_updated', {
          messageId: message.id,
          status: MessageStatusEnum.READ,
          readAt: new Date(),
          readerId: userId,
        });
      }
    });
  }

  // ✅ 获取消息状态
  @SubscribeMessage('get_message_status')
  async handleGetMessageStatus(client: Socket, payload: { messageId: number }) {
    const status = await this.messageService.getMessageStatus(
      payload.messageId,
    );
    client.emit('message_status_response', {
      messageId: payload.messageId,
      status,
    });
  }

  // ==============================
  // 🔥 【唯一正确】给商家推送新订单
  // ==============================
  sendOrderToMerchant(merchantUserId: number, orderData: any) {
    const room = `user_${merchantUserId}`;
    console.log('✅ 真正的 chat 命名空间 server 推送：', room);
    // 👉 这里的 this.server 100% 存在！
    this.server.to(room).emit('new_shop_order', orderData);
  }

  // ==============================
  // 用户状态管理
  // ==============================

  /**
   * 广播用户状态变化
   * @param userId 用户ID
   * @param status 新状态
   */
  private broadcastUserStatus(userId: number, status: UserStatusEnum) {
    this.server.emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * 处理用户状态更新
   */
  @SubscribeMessage('update_status')
  async handleUpdateStatus(client: Socket, payload: { status: UserStatusEnum }) {
    const userId = client.data.userId;
    if (userId) {
      const userInfo = this.onlineUsers.get(userId);
      if (userInfo) {
        // 更新状态
        userInfo.status = payload.status;
        this.onlineUsers.set(userId, userInfo);
        this.logger.log(`用户 ${userId} 状态更新为: ${payload.status}`);
        
        // 广播状态变化
        this.broadcastUserStatus(userId, payload.status);
        
        // 确认状态更新
        client.emit('status_updated', {
          userId,
          status: payload.status,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * 获取用户在线状态
   */
  @SubscribeMessage('get_user_status')
  async handleGetUserStatus(client: Socket, payload: { userId: number }) {
    const userInfo = this.onlineUsers.get(payload.userId);
    const status = userInfo ? userInfo.status : UserStatusEnum.OFFLINE;
    
    client.emit('user_status_response', {
      userId: payload.userId,
      status,
    });
  }

  /**
   * 获取所有在线用户
   */
  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(client: Socket) {
    const onlineUsers = [];
    this.onlineUsers.forEach((userInfo, userId) => {
      onlineUsers.push({
        userId,
        status: userInfo.status,
      });
    });
    
    client.emit('online_users_response', {
      onlineUsers,
    });
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * 获取用户状态
   */
  getUserStatus(userId: number): UserStatusEnum {
    const userInfo = this.onlineUsers.get(userId);
    return userInfo ? userInfo.status : UserStatusEnum.OFFLINE;
  }
}

