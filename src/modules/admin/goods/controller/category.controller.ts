import { Body, Controller,Get,Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { CategoryService } from "../service/category.service";


@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
// @UseGuards(AuthGuard)
@ApiAuth()
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('test')
    test(){
       return '测试接口';
    }
}