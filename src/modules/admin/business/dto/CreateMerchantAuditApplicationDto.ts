import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateMerchantAuditApplicationDto {
  @IsString()
  reason: string;
  
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  id: string;

}