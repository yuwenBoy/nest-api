import { ApiProperty } from "@nestjs/swagger";

/***
 * 保存用户角色表 dto
 */
export class UserRoleDto {
  @ApiProperty({ description: '用户id' })
  userId: number;

  @ApiProperty({ description: '角色ids' })
  roles?: string[];
}
