import {
  Controller,
  Get,
  Query,
  Headers,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { GetDataDto, PostDataDto } from './dto/hello.dto';
import { HelloService } from './hello.service';

@Controller('/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  // get请求
  @Get('')
  fetch(@Query() params: GetDataDto, @Headers('token') token): string {
    console.log(token);
    return this.helloService.getHello(params.id);
  }

  // post请求
  @Post()
  save(@Body() data: PostDataDto) {
    return this.helloService.postHello(data);
  }

  // put请求
  @Put(':id')
  update(@Param() { id }, @Body() { message }): string {
    return this.helloService.updateHello(id, message);
  }

  // delete请求
  @Delete()
  remove(@Query() { id }): string {
    return this.helloService.removeHello(id);
  }
}
