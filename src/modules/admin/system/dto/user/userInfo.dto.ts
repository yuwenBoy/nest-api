import { ApiProperty } from '@nestjs/swagger';

/**
 * 当前登录用户信息
 */
export class UserInfoDto { 
  @ApiProperty({ description: '账号' })
  username: string;

  @ApiProperty({ description: '用户id' })
  id: number;
}
