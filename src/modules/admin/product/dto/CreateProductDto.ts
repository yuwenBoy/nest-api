import { DynamicAttributeEntity } from './../../../../entities/admin/dynamic_attribute.entity';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional, IsInt, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { ProductSpecEntity } from '../../../../entities/product/product_spec.entity';
import { PropertiesMainDTO } from './propertiesMainDto';
import { ApiProperty } from '@nestjs/swagger';

export class SaveProductDto {

  /***
   * 产品id
   */
  id?:number;  

  /**
   * 产品名称
   * - 必填：必须提供产品名称
   * - 类型：字符串
   */  
  @IsNotEmpty()
  @IsString()
  productName: string;
  
 /**
   * 门店ID
   * - 必填：门店ID
   * - 类型：整数
   */ 
  @IsInt()
  storeId: number;  // axios拦截器添加的字段
   /**
   * 产品名称
   * - 选填：
   * - 类型：字符串
   */  
  description?:string;
   
   /**
   * 产品菜单分组id
   * - 必填：产品菜单分组id
   * - 类型：整数
   */  
  @IsNotEmpty()
  groupId: number;


  @IsArray() // 确保字段是一个数组
  @IsNotEmpty() // 确保数组不为空
  categories: number[];

  @ApiProperty({
    description: '产品图片',
    isArray: true,
    example: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true }) // 确保数组中的每个元素都是字符串
  @IsUrl({}, { each: true }) // 确保数组中的每个元素都是有效的 URL
  imageUrl?: string[];


    /**
   * 产品动态属性详情
   * - 必填：
   * - 类型：数组
   */  
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicAttributeEntity)
  dynamicAttributeList: DynamicAttributeEntity[];

   /**
   * 产品规格
   * - 必填：
   * - 类型：数组
   */  
  @IsArray()
  @Type(() => ProductSpecEntity)
  product_spea: ProductSpecEntity[];

   /**
   * 产品规格属性
   * - 必填：
   * - 类型：数组
   */  
   @ApiProperty({ description: '产品规格属性' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertiesMainDTO)
   properties:PropertiesMainDTO[]
}