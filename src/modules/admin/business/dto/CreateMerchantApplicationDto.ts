import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class CreateMerchantApplicationDto {
  /** 申请人ID（当前操作用户ID） */
  @IsOptional()
  @IsNumber({}, { message: '申请人ID必须为数字' })
  applicantId?: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
//   @IsPhoneNumber('ANY')
  contactPhone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsString()
  businessLicense: string;
  @IsNotEmpty()

  @IsString()
  healthLicense: string;

  @IsNotEmpty()
  categories: Array<number>;

  description?:string;

  logoUrl?:string;

  coverUrl?:string;
}