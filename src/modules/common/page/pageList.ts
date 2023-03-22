import { ApiProperty } from "@nestjsx/crud/lib/crud";
import { PaginationVo } from "src/modules/common/page/paging.dto";

/**
 * 返回分页列表
 */
export class PageListVo extends PaginationVo{
    @ApiProperty({descrition:'返回分页数据列表',type:[],isArray:true})
    content:any
}