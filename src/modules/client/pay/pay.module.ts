import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../../entities/business/order.entity';
import { OrderItemEntity } from '../../../entities/business/order_item.entity';
import { StoreEntity } from '../../../entities/store/store.entity';
import { AuthModule } from '../user/auth/auth.module';
import { PayService } from './service/pay.service';
import { PayController } from './controller/pay.controller';
import { WxPayService } from './service/wxpay.service';
import { MessageModule } from '../../chat/service/message.module';
@Module({
  imports: [
    AuthModule,
    MessageModule, // 👈 导入聊天模块
    RouterModule.register([{ path: 'client', module: PayModule }]),
    TypeOrmModule.forFeature([
        OrderEntity,
        OrderItemEntity,
        StoreEntity,
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
