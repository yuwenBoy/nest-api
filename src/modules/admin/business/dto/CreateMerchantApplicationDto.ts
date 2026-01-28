import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateMerchantApplicationDto {
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