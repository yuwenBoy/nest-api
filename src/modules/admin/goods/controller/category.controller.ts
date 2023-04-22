import { Body, Controller,Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { CategoryService } from "../service/category.service";


@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @ApiOperation({ summary: '查询机构列表' })
    @Post('/getByCondition')
    list(@Body() query):Promise<any> {
      return this.categoryService.pageQuery(query);
    }
}