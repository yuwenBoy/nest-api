// src/modules/store/dto/store-operation.dto.ts
import { IsInt, IsNotEmpty, Min, IsOptional, Max } from 'class-validator';
import { Type } from 'class-transformer';

/** 门店营业状态操作DTO */
export class StoreOperationDto {
  /** 门店ID */
  @IsInt({ message: '门店ID必须为数字' })
  @Min(1, { message: '门店ID不能小于1' })
  @Type(() => Number)
  @IsNotEmpty({ message: '门店ID不能为空' })
  storeId: number;

  /** 延时关店分钟数（仅case 2需要，默认5） */
  @IsOptional()
  @IsInt({ message: '延时分钟数必须为数字' })
  @Min(1, { message: '延时分钟数不能小于1' })
  @Max(1440, { message: '延时分钟数不能超过1天（1440分钟）' })
  @Type(() => Number)
  delay?: number = 5;
}