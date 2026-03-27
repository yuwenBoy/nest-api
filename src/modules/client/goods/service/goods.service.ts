import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 获取商品详情
   */
  async detail(id: number) {
     
  } 
}
