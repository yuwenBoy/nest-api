import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAddressService } from '../service/address.service';
import { IdDto } from '../dto/id.dto';
import { CreateAddressDto, UpdateAddressDto } from '../dto/user.address.dto';
import { SkipLog } from 'src/common/decorators/skip-log.decorator';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators';
import { ClientAuthGuard } from 'src/modules/common/auth/client-auth.guard';

@ApiTags('客户端用户地址模块')
@UseGuards(ClientAuthGuard)
@SkipLog()
@Controller('address')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  /**
   * 获取地址列表
   * POST /api/address/list
   */
  @ApiOperation({
    summary: '获取审核记录列表',
    description: '获取审核记录列表',
  })
  @HttpCode(HttpStatus.OK)
  @Post('list')
  findAll(@CurrentUser() userInfo: any) {
    const customerId = userInfo.userId;
    return this.userAddressService.findAll(customerId);
  }

  /**
   * 获取地址详情
   * GET /api/address/detail/:id
   */
  @HttpCode(HttpStatus.OK)
  @Post('detail')
  findOne(@Body() idDto: any, @CurrentUser() userInfo: any) {
    const customerId = userInfo.userId;
    return this.userAddressService.findOne(idDto.id, customerId);
  }

  /**
   * 新增地址
   */
  @HttpCode(HttpStatus.OK)
  @Post('add')
  create(@Body() createAddressDto: CreateAddressDto, @CurrentUser() user) {
    const customerId = user.userId;
    return this.userAddressService.create(createAddressDto, customerId);
  }

  /**
   * 编辑地址
   */
  @HttpCode(HttpStatus.OK)
  @Post('edit')
  update(@Body() updateAddressDto: UpdateAddressDto, @CurrentUser() user) {
    const customerId = user.userId;
    return this.userAddressService.update(updateAddressDto, customerId);
  }

  /**
   * 设置默认地址
   * POST /api/address/setDefault/:id
   */
  @HttpCode(HttpStatus.OK)
  @Post('setDefaultAddress')
  setDefaultAddress(@Body() id: any, @CurrentUser() user) {
    const customerId = user.userId;
    return this.userAddressService.setDefault(id, customerId);
  }

  /**
   * 删除地址
   */
  @HttpCode(HttpStatus.OK)
  @Post('deleteAddress')
  remove(@Body() id: any, @CurrentUser() user) {
    const customerId = user.customerId;
    return this.userAddressService.remove(id, customerId);
  }

  @Get('defaultAddress')
  async getDefaultAddress(@CurrentUser() user) {
    const userId = user.id;
    return this.userAddressService.getDefaultAddress(userId);
  }
}
