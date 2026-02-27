import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { attributeTypeEnum } from 'src/enum/admin_enum';

/**
 * description:动态属性表
 * @createTime:2025-3-17 15:57:49
 * @updateTime：2025-3-17 15:57:54
 * @Author:zhao.jian
 */
@Entity("dynamic_attribute")
export class DynamicAttributeEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'attribute_name'})
    attributeName: String;

    @Column({type:'enum',default:attributeTypeEnum.TEXT,enum:attributeTypeEnum, name: 'attribute_type',comment:'属性类型'})
    attributeType: number;

    @Column({type:'int', name: 'is_required',comment:'是否必填'})
    isRequired: number;

    @Column({type:'char', name: 'is_star',comment:'是否标星'})
    isStar: number;

    @Column({type:'varchar', name: 'description'})
    description: String;

     /**
      * 属性值
      */
    @Expose({ name: 'values' })
    values:any; // 定义属性值数组

    // 即使不存于数据库，也需声明虚拟字段
    @Expose({ name: 'attributeValue' }) // 若使用 class-transformer
    get attributeValue(): any {
        let response_type = null;
        if(this.attributeType===attributeTypeEnum.TEXT){
            response_type = '';
        }else if(this.attributeType===attributeTypeEnum.CASCADER){
            response_type = [];
        }
        else if(this.attributeType==attributeTypeEnum.SELECT){
            response_type = null;
        }
        else if(this.attributeType===attributeTypeEnum.BATCHSELECT){
            response_type = []; // 多选
        }
        return response_type;
    }  
}  


