import { Injectable,HttpException,HttpStatus } from "@nestjs/common";

@Injectable()
export class ToolsService {
    static fail(error,status = HttpStatus.BAD_REQUEST){
        throw new HttpException({
            message:'请求失败',
            error:error
        },status)
    }
}