import { IsString, IsNotEmpty, IsPhoneNumber, IsBoolean, IsOptional } from 'class-validator';
// 新增地址DTO
export class CreateAddressDto {
  @IsString({ message: '收货人姓名必须是字符串' })
  @IsNotEmpty({ message: '收货人姓名不能为空' })
  receiver: string;

  @IsNotEmpty({ message: '省份ID不能为空' })
  provinceId: number;

  @IsNotEmpty({ message: '城市ID不能为空' })
  cityId: number;

  @IsNotEmpty({ message: '区县ID不能为空' })
  areaId: number;

  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @IsString({ message: '省份必须是字符串' })
  @IsNotEmpty({ message: '省份不能为空' })
  province: string;

  @IsString({ message: '城市必须是字符串' })
  @IsNotEmpty({ message: '城市不能为空' })
  city: string;

  @IsString({ message: '区县必须是字符串' })
  @IsNotEmpty({ message: '区县不能为空' })
  area: string;

  @IsString({ message: '详细地址必须是字符串' })
  @IsNotEmpty({ message: '详细地址不能为空' })
  detailAddress: string;

  isDefault: number;
}

// 编辑地址DTO（继承新增DTO，增加ID）
export class UpdateAddressDto extends CreateAddressDto {
  @IsNotEmpty({ message: '地址ID不能为空' })
  id: number;
}