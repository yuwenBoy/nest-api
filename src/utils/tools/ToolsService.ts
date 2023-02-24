import { Injectable,HttpException,HttpStatus } from "@nestjs/common";
import * as svgCaptcha from 'svg-captcha';
@Injectable()
export class ToolsService {
    static fail(error,status = HttpStatus.BAD_REQUEST){
        throw new HttpException({
            message:'请求失败',
            error:error
        },status)
    }

    /**
     * 生成随机验证码吗
     * @param size 验证码个数
     * @returns 对象
     */
    async captche(size = 4){
        const captcha = svgCaptcha.create({
            size,//生成验证码个数
            fontSize:50, // 文字大小
            width:100, // 宽度
            height:34, // 高度
            color:true,
            // background:'#cc9966', //背景颜色
            // ignoreChars:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz',
        })

        return captcha;
    }
}