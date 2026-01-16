import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from '../modules/chat/service/message.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:8080', // Vue 开发服务器地址
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private jwtService: JwtService,
    private messageService: MessageService,
  ) {}

  // 客户端连接时验证 token
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.userId; // 将用户ID挂载到socket
      this.logger.log(`用户 ${payload.userId} 已连接: ${client.id}`);
    } catch (error) {
      this.logger.error('WebSocket 认证失败');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开连接: ${client.id}`);
  }

  // 监听私聊消息
  @SubscribeMessage('private_message')
  async handlePrivateMessage(client: Socket, payload: any) {
    const { receiverId, content } = payload;
    const senderId = client.data.userId;

    // 1. 保存消息到数据库
    const message = await this.messageService.create({
      senderId,
      receiverId,
      content,
    });

    // 2. 发送给接收者（如果在线）
    this.server.to(`user_${receiverId}`).emit('new_message', message);

    // 3. 回执给发送者
    client.emit('message_sent', message);
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
}
