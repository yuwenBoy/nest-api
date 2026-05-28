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
import { UserEntity } from '../entities/admin/t_user.entity';
import { DataSource } from 'typeorm';
import { MessageStatusEnum } from '../enum/chat_enum';
import { getClientIp, getIpLocation } from '../utils/index';

// 用户状态枚举
export enum UserStatusEnum {
  ONLINE = 'online', // 在线
  BUSY = 'busy', // 忙碌
  OFFLINE = 'offline', // 关闭/离线
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

  // 在线用户状态管理: key = userId, value = { socketId, status } (静态属性，可被类直接访问)

  public static onlineUsers: Map<
    number,
    {
      socketId: string;
      status: UserStatusEnum;
      ip: string;
      username: string;
      cname: string;
      location: string;
      browser: string;
      os: string;
      loginTime: Date;
      lastActiveTime: Date;
    }
  > = new Map();

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

        // 先尝试用管理员token验证
        userInfo = this.AuthService.verifyToken(token);
        
        // 如果管理员验证失败，尝试用客户端token验证
        if (!userInfo) {
          this.logger.log('管理员Token验证失败，尝试客户端Token验证...');
          userInfo = this.AuthService.verifyClientToken(token);
        }

        this.logger.log('Token 验证成功！');
        this.logger.log('用户信息:', userInfo);
        const userId = userInfo?.id || userInfo?.userId;
        this.logger.log('用户ID:', userId);
      } catch (error) {
        this.logger.error('WebSocket 认证失败:', error.message);

        client.emit('error', { message: 'WebSocket 认证失败' });

        // 关闭连接
        client.disconnect(true);
        return;
      }

      // 检查用户信息（支持 id 和 userId 两种字段名）
      const userId = userInfo?.id || userInfo?.userId;
      if (!userInfo || !userId) {
        this.logger.error('用户信息为空或缺少ID');
        client.disconnect(true);
        return;
      }

      // 3. 解析浏览器 + 操作系统
      const UAParserModule = require('ua-parser-js');
      const ua = new UAParserModule(client.handshake.headers['user-agent']);
      const browser = ua.getBrowser().name || '未知浏览器';
      const os = ua.getOS().name || '未知系统';

      // 4. 获取真实IP
      const ip = getClientIp(client);

      // 5. 获取IP所在城市（登录地点）
      const location = await getIpLocation(ip);

      // 加入房间
      const roomName = `user_${userId}`;

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

      client.data.userId = userId; // 将用户ID挂载到socket
      //    client.data.username = userInfo.username; // 将用户名挂载到socket
      // 2. 👇 新增：查用户名、昵称
      this.logger.log(`开始查询用户信息，用户ID: ${userId}`);
      const user = await this.dataSource.getRepository(UserEntity).findOne({
        where: { id: userId },
        select: ['id', 'username', 'cname'],
      });

      this.logger.log('查询到的用户:', user);

      if (!user) {
        this.logger.error(`未找到用户，ID: ${userId}`);
        client.disconnect(true);
        return;
      }

      // 从数据库读取用户的在线状态，如果没有则默认为在线
      const userRepository = this.dataSource.getRepository(UserEntity);
      const dbUser = await userRepository.findOne({ where: { id: userId } });
      const savedStatus = (dbUser?.onlineStatus as UserStatusEnum) || UserStatusEnum.ONLINE;
      
      // 添加到在线用户列表
      const now = new Date();
      ChatGateway.onlineUsers.set(userId, {
        socketId: client.id,
        status: savedStatus,
        ip: client.request.connection.remoteAddress,
        username: user.username,
        cname: user.cname,
        location: location,
        browser,
        os,
        loginTime: now,
        lastActiveTime: now,
      });
      this.logger.log(
        `用户 ${userId} 上线，状态: ${UserStatusEnum.ONLINE}，当前在线用户数: ${ChatGateway.onlineUsers.size}`,
      );

      // 广播用户上线状态（使用数据库中的状态）
      this.broadcastUserStatus(userId, savedStatus);

      // 4. 发送欢迎消息（使用数据库中的状态）
      client.emit('connected', {
        message: 'WebSocket 连接成功！',
        userId: userId,
        status: savedStatus,
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
      const userInfo = ChatGateway.onlineUsers.get(userId);
      if (userInfo) {
        ChatGateway.onlineUsers.delete(userId);
        this.logger.log(
          `用户 ${userId} 下线，当前在线用户数: ${ChatGateway.onlineUsers.size}`,
        );
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
    
    // 更新发送者最后活跃时间
    this.updateLastActiveTime(senderId);
    
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
  // 【新订单通知】支付成功后推送给商家（带弹窗）
  // ==============================
  sendNewOrderNotification(
    storeId: number,
    notificationData: {
      type: string;
      orderId: number;
      orderNo: string;
      storeId: number;
      storeName: string;
      finalTotal: number;
      orderStatus: number;
      statusText: string;
      payTime: Date;
      autoAccepted: boolean;
      message: string;
      timestamp: Date;
    },
  ) {
    // 推送给商家的房间
    const merchantRoom = `store_${storeId}`;
    const adminRoom = 'admin_orders'; // 管理员可以监听所有订单

    console.log('📦 推送新订单通知到商家:', merchantRoom);

    // 推送到商家专用房间
    this.server
      .to(merchantRoom)
      .emit('new_order_notification', notificationData);

    // 同时推送到管理员房间
    this.server.to(adminRoom).emit('new_order_notification', notificationData);

    // 播放提示音给商家
    this.server.to(merchantRoom).emit('play_notification_sound', {
      type: 'new_order',
      orderNo: notificationData.orderNo,
    });

    // 广播给所有在线管理员
    this.server.emit('order_created', {
      orderId: notificationData.orderId,
      orderNo: notificationData.orderNo,
      storeId: notificationData.storeId,
      storeName: notificationData.storeName,
      finalTotal: notificationData.finalTotal,
      timestamp: notificationData.timestamp,
    });
  }

  // ==============================
  // 【订单状态推送】主动推送给用户/商家
  // ==============================
  sendOrderStatusUpdate(
    targetType: 'user' | 'merchant',
    targetId: number,
    orderData: {
      orderId: number;
      orderNo: string;
      status: number;
      statusText: string;
      message?: string;
      extra?: any;
    },
  ) {
    const room = `${targetType}_${targetId}`;
    console.log(`📢 推送订单状态更新到 ${room}:`, orderData.statusText);

    this.server.to(room).emit('order_status_changed', {
      ...orderData,
      timestamp: new Date(),
    });
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
   * 更新用户最后活跃时间
   * @param userId 用户ID
   */
  private updateLastActiveTime(userId: number) {
    const userInfo = ChatGateway.onlineUsers.get(userId);
    if (userInfo) {
      userInfo.lastActiveTime = new Date();
      ChatGateway.onlineUsers.set(userId, userInfo);
    }
  }

  /**
   * 处理用户状态更新
   */
  @SubscribeMessage('update_status')
  async handleUpdateStatus(
    client: Socket,
    payload: { status: UserStatusEnum },
  ) {
    this.logger.log(`收到状态更新请求: userId=${client.data.userId}, status=${payload.status}`);
    const userId = client.data.userId;
    if (userId) {
      const userInfo = ChatGateway.onlineUsers.get(userId);
      if (userInfo) {
        // 更新状态
        userInfo.status = payload.status;
        ChatGateway.onlineUsers.set(userId, userInfo);
        
        // 更新最后活跃时间
        this.updateLastActiveTime(userId);
        
        // 保存状态到数据库
        const userRepository = this.dataSource.getRepository(UserEntity);
        try {
          const result = await userRepository.update(userId, { onlineStatus: payload.status });
          this.logger.log(`用户 ${userId} 状态更新到数据库: ${payload.status}, 影响行数: ${result.affected}`);
        } catch (error) {
          this.logger.error(`用户 ${userId} 状态保存失败: ${error.message}`);
        }
        
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
    const userInfo = ChatGateway.onlineUsers.get(payload.userId);
    const status = userInfo ? userInfo.status : UserStatusEnum.OFFLINE;

    client.emit('user_status_response', {
      userId: payload.userId,
      status,
    });
  }

  /**
   * 标记消息为已读（匹配前端的 mark_as_read 事件）
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkMessagesRead(client: Socket, payload: { messageIds: number[] }) {
    const messageIds = payload.messageIds;
    
    this.logger.log(`收到标记已读请求: messageIds=${messageIds}`);
    
    if (messageIds && messageIds.length > 0) {
      try {
        await this.messageService.markAsReadByMessageIds(messageIds);
        this.logger.log(`消息已成功标记为已读: messageIds=${messageIds}`);
        
        client.emit('messages_marked_read', {
          messageIds,
          timestamp: new Date(),
        });
      } catch (error) {
        this.logger.error(`标记消息已读失败: ${error.message}`);
      }
    }
  }

  /**
   * 标记整个会话的消息为已读（匹配前端的 mark_conversation_read 事件）
   */
  @SubscribeMessage('mark_conversation_read')
  async handleMarkConversationRead(client: Socket, payload: { targetId: number; targetType: number }) {
    const userId = client.data.userId;
    const { targetId, targetType } = payload;
    
    this.logger.log(`收到标记会话已读请求: userId=${userId}, targetId=${targetId}, targetType=${targetType}`);
    
    if (userId && targetId) {
      try {
        await this.messageService.markConversationRead(userId, targetId, targetType);
        this.logger.log(`会话已成功标记为已读: userId=${userId}, targetId=${targetId}`);
        
        client.emit('conversation_marked_read', {
          userId,
          targetId,
          targetType,
          timestamp: new Date(),
        });
      } catch (error) {
        this.logger.error(`标记会话已读失败: ${error.message}`);
      }
    }
  }

  /**
   * 获取所有在线用户
   */
  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(client: Socket) {
    const onlineUsers = [];
    ChatGateway.onlineUsers.forEach((userInfo, userId) => {
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
    return ChatGateway.onlineUsers.has(userId);
  }

  /**
   * 获取用户状态
   */
  getUserStatus(userId: number): UserStatusEnum {
    const userInfo = ChatGateway.onlineUsers.get(userId);
    return userInfo ? userInfo.status : UserStatusEnum.OFFLINE;
  }
}
