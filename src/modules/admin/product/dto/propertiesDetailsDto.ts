import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class DetailDTO {

  @ApiProperty({ description: '选项id' })
  @IsOptional()
  id?:number | null;
      
  @ApiProperty({ description: '子项名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '销售状态' })
  @IsInt()
  saleStatus: number;
}