import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userOrderController } from './controller/userOrder.controller';
import { UserOrderService } from './service/userOrder.service';
import { MerchantOrderController } from './controller/merchantOrder.controller';
import { MerchantOrderService } from './service/merchantOrder.service';
import { OrderEntity } from '../../../entities/business/order.entity';
import { OrderItemEntity } from '../../../entities/business/order_item.entity';
import { MessageModule } from '../../chat/service/message.module';
import { AuthGuard } from '../../common/auth/auth.guard';

@Module({
  imports: [
    MessageModule, // 导入聊天模块以使用 ChatGateway
    RouterModule.register([{ path: '', module: OrderModule }]),
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
  controllers: [
    userOrderController,
    MerchantOrderController,
  ],
  providers: [
    UserOrderService,
    MerchantOrderService,
    AuthGuard,
  ],
})
export class OrderModule {}
