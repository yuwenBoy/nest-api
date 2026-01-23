import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: '手机号必须是字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Length(11, 11, { message: '手机号必须为11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式错误' })
  phone: string;

  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(4,4, { message: '验证码必须为4位' })
  code: string;
}
