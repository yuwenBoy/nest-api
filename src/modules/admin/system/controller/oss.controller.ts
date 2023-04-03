import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from "@nestjs/platform-express"
import { CurrentUser } from 'src/common/decorator/current.user';
import { UserInfoDto } from '../dto/user/userInfo.dto';
import { OssService } from '../service/oss.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

@ApiTags('文件存储')
@UseGuards(JwtAuthGuard)
@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post('/updateAvatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadFile(@UploadedFile() avatar:Express.Multer.File,@Body() params:{business:string},@CurrentUser() user:UserInfoDto):Promise<any> {
    return await this.ossService.updateAvatar([avatar],user);
  }
}
