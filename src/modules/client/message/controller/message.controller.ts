import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { ClientAuthGuard } from '../../../common/auth/client-auth.guard';
import { SkipLog } from '../../../../common/decorators/skip-log.decorator';

@SkipLog()
@Controller('client/message')
@UseGuards(ClientAuthGuard)
export class ClientMessageController {
  constructor(private readonly messageService: MessageService) {}

  @HttpCode(200)
  @Post('list')
  async getMessageList(@Request() req) {
    return await this.messageService.getMessageList(req.user.userId);  // ✅ 修复：使用 userId 而不是 id
  }
  @HttpCode(200)
  @Post('history')
  async getMessageHistory(@Body() body, @Request() req) {
    console.log('=== 客户端消息历史接口 ===');
    console.log('当前用户:', req.user);
    console.log('请求体:', body);
    console.log('targetUserId:', body.targetUserId);
    console.log('============================');
    return await this.messageService.getMessageHistory(
      req.user.userId,  // ✅ 修复：使用 userId 而不是 id
      body.targetUserId,
      body.orderId
    );
  }

  @HttpCode(200)
  @Post('send')
  async sendMessage(@Body() body, @Request() req) {
    return await this.messageService.sendMessage({
      senderId: req.user.userId,  // ✅ 修复：使用 userId 而不是 id
      receiverId: body.receiverId,
      content: body.content,
      orderId: body.orderId,
      messageType: 'text'
    });
  }

  @HttpCode(200)
  @Post('markRead')
  async markAsRead(@Body() body, @Request() req) {
    return await this.messageService.markAsRead(req.user.userId, body.targetUserId);  // ✅ 修复：使用 userId 而不是 id
  }
}
