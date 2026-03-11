import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsDate, IsNotEmpty, ValidateIf, IsObject, ValidateNested } from 'class-validator';

// 主体资质子DTO
class LicenseInfoDTO {
  @IsNumber()
  @IsNotEmpty({ message: '请选择证照类型' })
  license_type: number;

  @IsString()
  @IsNotEmpty({ message: '证照照片不能为空' })
  license_pic: string;

  @IsString()
  @IsNotEmpty({ message: '请输入注册号' })
  license_no: string;

  @IsString()
  @IsNotEmpty({ message: '请输入单位名称' })
  company_name: string;

  @IsString()
  @IsNotEmpty({ message: '请输入法定代表人' })
  legal_person: string;

  @IsString()
  @IsNotEmpty({ message: '请输入经营场所' })
  license_plan: string;

  // 关键修正：非长期时才校验，且兼容空字符串/undefined
  @ValidateIf(o => o.is_long_term === 0) 
  @IsDate({ message: '营业执照有效期格式错误（需为YYYY-MM-DD）' })
  @IsNotEmpty({ message: '请选择营业执照有效期' })
  @Type(() => Date) // 自动转换字符串为Date
  license_valid_date?: Date | string;

  @IsNumber()
  @IsNotEmpty({ message: '请选择是否长期有效' })
  is_long_term: number;
}

// 行业资质子DTO
class PermitInfoDTO {
  @IsNumber()
  @IsNotEmpty({ message: '请选择证照类型' })
  permit_type: number;

  @IsString()
  @IsNotEmpty({ message: '证照照片不能为空' })
  permit_pic: string;

  @IsString()
  @IsNotEmpty({ message: '请输入许可证编号' })
  permit_no: string;

  @IsString()
  @IsNotEmpty({ message: '请输入单位名称' })
  permit_name: string;

  @IsString()
  @IsNotEmpty({ message: '请输入法定代表人' })
  permit_legalPerson: string;

  @IsString()
  @IsNotEmpty({ message: '请输入经营场所' })
  permit_address: string;

  @IsString()
  @IsNotEmpty({ message: '请输入主体业态' })
  permit_mainBusiness: string;

  @IsString()
  @IsNotEmpty({ message: '请输入经营项目' })
  permit_scope: string;

  // 关键修正：非长期时才校验，自动转换字符串为Date
  @ValidateIf(o => o.is_rang_date === 0) 
  @IsDate({ message: '许可证有效期格式错误（需为YYYY-MM-DD）' })
  @IsNotEmpty({ message: '请选择许可证有效期' })
  @Type(() => Date) // 核心：把前端字符串日期转成Date类型
  permit_expireDate?: Date | string;

  @IsNumber()
  @IsNotEmpty({ message: '请选择是否长期有效' })
  is_rang_date: number;
}

// 主DTO（完全对齐前端传参）
export class UpdateStoreDTO {
  // 补充storeId的校验规则（前端传了，必须加）
  @IsNumber()
  @IsNotEmpty({ message: '门店ID不能为空' })
  storeId: number;  

  // 基础信息
  @IsString()
  @IsNotEmpty({ message: '请输入门店名称' })
  storeName: string;

  @IsString()
  @IsNotEmpty({ message: '门脸图不能为空' })
  doorPhoto: string;

  @IsString()
  @IsNotEmpty({ message: '店内环境图片不能为空' })
  envPhoto: string;

  // 资质信息（嵌套校验必须加@Type）
  @IsObject()
  @ValidateNested()
  @Type(() => LicenseInfoDTO) // 必须指定子DTO类型
  @IsNotEmpty({ message: '主体资质不能为空' })
  licenseInfo: LicenseInfoDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => PermitInfoDTO)
  @IsNotEmpty({ message: '行业资质不能为空' })
  permitInfo: PermitInfoDTO;

  // 地址信息：修正类型定义（@IsNumber()对应number类型）
  @IsNumber()
  @IsNotEmpty({ message: '请选择所在地区' })
  districtCode: number; // 之前是string，改为number

  @IsString()
  @IsNotEmpty({ message: '记得完善道路、门牌号、单元室等' })
  detailAddress: string;

  // 经纬度：修正类型定义（@IsNumber()对应number类型）
  @IsNumber()
  @IsOptional()
  latitude?: number; // 之前是string，改为number

  @IsNumber()
  @IsOptional()
  longitude?: number; // 之前是string，改为number
}