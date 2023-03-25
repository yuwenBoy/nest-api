import { ApiProperty } from "@nestjs/swagger";

/***
 * 角色模块关系表 request dto
 */
export class RoleModuleDto {
  @ApiProperty({ description: '角色id' })
  roleId: number;

  @ApiProperty({ description: '模块ids' })
  moduleId?: string[];
}
