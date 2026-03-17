import { IsNotEmpty, IsNumber } from 'class-validator';

export class IdDto {
  @IsNumber({}, { message: 'ID必须是数字' })
  @IsNotEmpty({ message: 'ID不能为空' })
  id: number;
}