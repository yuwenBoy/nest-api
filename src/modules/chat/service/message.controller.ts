import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  // 获取私聊历史
  @Get('private')
  async getPrivateMessages(
    @Request() req,
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
  ) {
    return await this.messageService.getPrivateHistory(
      req.user.userId,
      parseInt(userId),
      page,
    );
  }

  // 获取群聊历史
  @Get('group')
  async getGroupMessages(
    @Query('groupId') groupId: string,
    @Query('page') page: number = 1,
  ) {
    return await this.messageService.getGroupHistory(parseInt(groupId), page);
  }
}
