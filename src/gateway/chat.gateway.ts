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
import { JwtService } from '@nestjs/jwt';
import { MessageService } from '../modules/chat/service/message.service';
import { cli } from 'winston/lib/winston/config';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { DataSource } from 'typeorm';

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

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private dataSource: DataSource, // ✅ 用于复杂查询

  ) {}

  // 客户端连接时验证 token
  async handleConnection(client: Socket) {
    try {
      
      console.log('客户端连接')  
      const token = client.handshake.auth.token;
      if(!token){
        this.logger.error('未提供token，连接被拒绝');
        client.emit('error',{message:'未提供认证token'})
        client.disconnect(true);
        return;
      }
      let userInfo;
        try {
          userInfo =  this.AuthService.verifyToken(token)

        } catch (error) {
          this.logger.error('WebSocket 认证失败');
          client.emit('error',{message:'WebSocket 认证失败'})
          client.disconnect(true);
          return;
        }
          // ✅ 关键：将用户加入自己的房间
       client.join(`user_${userInfo.userId}`);
      console.log(`✅ 用户 ${userInfo.id} 加入房间: user_${userInfo.id}`);
       console.log('userinfo',JSON.stringify(userInfo)) 
       client.data.userId = userInfo.id; // 将用户ID挂载到socket
       client.data.username = userInfo.username; // 将用户名挂载到socket
       this.logger.log(`✅ 用户 ${userInfo.id} 连接成功: ${client.id}`);
      
      // 4. 发送欢迎消息
      client.emit('connected', { 
        message: 'WebSocket 连接成功！',
        userId: userInfo.userId 
      })
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
    // 1. 保存消息
    const message = await this.messageService.create({
        senderId,
        receiverId,
        content,
    });

    // 2. 查询发送者信息（用于显示）
    const sender = await this.dataSource.getRepository(UserEntity).findOne({
        where: { id: senderId },
        select: ['id', 'username', 'avatar'],
    });

    const messageWithUser = {
        ...message,
        senderUsername: sender?.username || `用户${senderId}`,
        senderAvatar: sender?.avatar,
    };

    // 3. ✅ 广播给接收者（关键：发送给接收者的房间）
    const receiverRoom = `user_${receiverId}`;
    console.log('📨 正在广播到房间:', receiverRoom);
    this.server.to(receiverRoom).emit('new_message', messageWithUser);
    
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
}
