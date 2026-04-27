import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userOrderController } from './controller/userOrder.controller';
import { UserOrderService } from './service/userOrder.service';
import { OrderEntity } from 'src/entities/business/order.entity';
import { OrderItemEntity } from 'src/entities/business/order_item.entity';
import { AuthModule } from '../user/auth/auth.module';
import { WxPayService } from '../pay/service/wxpay.service';
import { MessageModule } from 'src/modules/chat/service/message.module';

@Module({
  imports: [
    AuthModule,
    MessageModule, // 导入聊天模块以使用 ChatGateway
    RouterModule.register([{ path: 'client', module: OrderModule }]),
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
  controllers: [
    userOrderController,
  ],
  providers: [
    UserOrderService,
    WxPayService,
  ],
  exports: [UserOrderService, WxPayService],
})
export class OrderModule {}
