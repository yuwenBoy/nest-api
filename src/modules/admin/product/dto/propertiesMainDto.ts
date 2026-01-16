import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { DetailDTO } from './propertiesDetailsDto';

export class PropertiesMainDTO {
  
  @ApiProperty({ description: '属性组名称' })
  @IsOptional()
  id?:number | null;

  @ApiProperty({ description: '属性组名称' })
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true }) // 确保数组中的每个元素都符合DetailDTO的规则
  @Type(() => DetailDTO) // 指定数组元素的类型
  details: DetailDTO[];
}