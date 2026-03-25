import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/business/order.entity';
import { OrderItemEntity } from 'src/entities/business/order_item.entity';
import { AuthModule } from '../user/auth/auth.module';
import { PayService } from './service/pay.service';
import { PayController } from './controller/pay.controller';
import { WxPayService } from './service/wxpay.service';
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: 'client', module: PayModule }]),
    TypeOrmModule.forFeature([
        // CategoryEntity,
        OrderEntity,
        OrderItemEntity,
    ]),
  ],
  controllers: [
    PayController
  ],
  providers: [
    PayService,
    WxPayService,
  ],
  exports:[PayService, WxPayService],
})
export class PayModule {}
