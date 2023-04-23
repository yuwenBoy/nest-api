import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { userOrderController } from './controller/userOrder.controller';
import { UserOrderService } from './service/userOrder.service';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: OrderModule }]),
    TypeOrmModule.forFeature([
        // CategoryEntity,
    ]),
  ],
  controllers: [
    userOrderController, 
  ],
  providers: [
    UserOrderService,
  ],
})
export class OrderModule {}
