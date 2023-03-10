import { Controller, Get, Query, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PositionService } from './position.service';

/***
 * author：zhao.jian
 * createTime：2023-3-8 21:39:18
 * description：职位控制器模块
 */
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}


  @ApiOperation({ summary: '查询机构下的职位' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getPositionByDeptId')
  getPositionByDeptId(@Query() query):Promise<any> {
    console.log('接受query参数'+query.pid)
    return this.positionService.getPositionByDeptId(query.deptId);
  }

}
