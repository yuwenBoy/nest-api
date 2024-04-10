import { Controller } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Controller('chat')
@WebSocketGateway()
export class ChatController {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('/message')
  handleMessage(client: Socket, message: string): void {
    // 处理收到的消息
    this.server.emit('message', message); // 广播消息给所有连接的客户端
  }
}