// common/pipe/validation.pipe.ts

/* 
 * 全局dto验证管道
 *
*/

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform<any>{
  // value 是当前处理的参数，而 metatype 是属性的元类型
  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log('进入全局管道...');
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // plainToClass方法将普通的javascript对象转换为特定类的实例
    const object = plainToClass(metatype, value);
    // 验证该对象返回出错的数组
    const errors = await validate(object);
    if (errors.length > 0) {
      // 将错误信息数组中的第一个内容返回给异常过滤器
      let errormsg = errors.shift().constraints;
      throw new BadRequestException(errormsg);
    }
    return value;
  }
  // 验证属性值的元类型是否是String, Boolean, Number, Array, Object中的一种
  private toValidate(metatype: any): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

}
