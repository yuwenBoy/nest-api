import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from "@nestjs/platform-express"
import { CurrentUser } from 'src/modules/common/collections-permission/decorators/current.user';
import { UserInfoDto } from '../dto/user/userInfo.dto';
import { OssService } from '../service/oss.service';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiAuth } from 'src/modules/common/collections-permission/decorators/api.auth';

@ApiTags('文件存储')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post('/updateAvatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadFile(@UploadedFile() avatar:Express.Multer.File,@Body() params:{business:string},@CurrentUser() user:UserInfoDto):Promise<any> {
    return await this.ossService.updateAvatar([avatar],user);
  }


  /***
   * 图片上传统一方法
   */
  @Post('/pictures')
  @UseInterceptors(FileInterceptor('file'))
  async pictures(@UploadedFile() file:Express.Multer.File,@Body() params:{business:string},@CurrentUser() user:UserInfoDto):Promise<any> {
    return await this.ossService.pictures([file]);
  }
}
