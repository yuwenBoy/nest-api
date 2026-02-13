import { Controller, Get, Query, UseGuards, Request, Body, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { SkipLog } from 'src/common/decorators/skip-log.decorator';

@SkipLog()
@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  // 获取聊天历史记录
  @Post('MessageHistory')
  async getPrivateMessages(@Body() body, @Request() req) {
    if(body.type === 'private'){
         return await this.messageService.getPrivateHistory(req.user.id,parseInt(body.userId),body.page);
    }else{
        //  return await this.messageService.getGroupHistory(parseInt(groupId), page);
    }
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
