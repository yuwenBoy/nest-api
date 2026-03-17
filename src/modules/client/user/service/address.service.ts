import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAddressEntity } from 'src/entities/client/user_address.entity';
import { Not, Repository } from 'typeorm';
import { CreateAddressDto, UpdateAddressDto } from '../dto/user.address.dto';
import { IdDto } from '../dto/id.dto';

@Injectable()
export class UserAddressService {
   constructor(
    @InjectRepository(UserAddressEntity)
    private addressRepository: Repository<UserAddressEntity>,
  ) {}

  /**
   * 获取当前用户的地址列表
   * @param customerId 顾客ID
   */
  async findAll(customerId: number) {
    return this.addressRepository.find({
      where: { profileUserId:customerId, deletedAt: null },
      order: { isDefault: 'DESC', updatedAt: 'DESC' }, // 默认地址排前面
    });
  }

  /**
   * 获取地址详情
   * @param id 地址ID
   * @param customerId 顾客ID（权限校验）
   */
  async findOne(id: number, customerId: number) {
    const address = await this.addressRepository.findOne({
      where: { id, profileUserId:customerId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundException('地址不存在或无访问权限');
    }

    return address;
  }

  /**
   * 新增地址
   * @param createAddressDto 地址信息
   * @param customerId 顾客ID
   */
  async create(createAddressDto: CreateAddressDto, customerId: number) {
    // 如果设置为默认地址，先把当前用户的其他默认地址改为非默认
    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { profileUserId:customerId, isDefault: 1, deletedAt: null },
        { isDefault: 0 },
      );
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      profileUserId:customerId,
      isDefault: createAddressDto.isDefault, // 转数字存储
    });

    return this.addressRepository.save(address);
  }

  /**
   * 编辑地址
   * @param updateAddressDto 地址信息
   * @param customerId 顾客ID
   */
  async update(updateAddressDto: UpdateAddressDto, customerId: number) {
    // 先校验地址是否存在且属于当前用户
    await this.findOne(updateAddressDto.id, customerId);

    // 如果设置为默认地址，先把其他默认地址改为非默认
    if (updateAddressDto.isDefault) {
      await this.addressRepository.update(
        { 
          profileUserId:customerId, 
          isDefault: 1, 
          deletedAt: null,
          id: Not(updateAddressDto.id), // 排除当前地址
        },
        { isDefault: 0 },
      );
    }

    await this.addressRepository.update(
      { id: updateAddressDto.id, profileUserId:customerId },
      {
        ...updateAddressDto,
        isDefault: updateAddressDto.isDefault ? 1 : 0,
      },
    );

    return this.findOne(updateAddressDto.id, customerId);
  }

  /**
   * 设置默认地址
   * @param idDto 地址ID
   * @param customerId 顾客ID
   */
  async setDefault(idDto: IdDto, customerId: number) {
    // 校验地址是否存在
    await this.findOne(idDto.id, customerId);

    // 1. 把所有地址改为非默认
    await this.addressRepository.update(
      { profileUserId:customerId, isDefault: 1, deletedAt: null },
      { isDefault: 0 },
    );

    // 2. 设置当前地址为默认
    await this.addressRepository.update(
      { id: idDto.id, profileUserId:customerId },
      { isDefault: 1 },
    );

    return { message: '设置默认地址成功' };
  }

  /**
   * 删除地址（软删除）
   * @param idDto 地址ID
   * @param customerId 顾客ID
   */
  async remove(idDto: IdDto, customerId: number) {
    // 校验地址是否存在
    const address = await this.findOne(idDto.id, customerId);

    // 软删除
    await this.addressRepository.softDelete({ id: idDto.id, profileUserId:customerId });

    return { message: '删除地址成功' };
  }
 
}
