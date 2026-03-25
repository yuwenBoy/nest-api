// import { Injectable } from '@nestjs/common';
// import * as crypto from 'crypto';

// @Injectable()
// export class AlipayService {
//   private readonly appId = '支付宝APPID';
//   private readonly privateKey = '你的应用私钥';
//   private readonly publicKey = '支付宝公钥';
//   private readonly notifyUrl = 'https://你的域名.com/order/pay/notify/alipay';
//   private readonly returnUrl = 'https://你的域名.com/pay/result';

//   async createH5Order(orderNo: string, totalAmount: string, subject: string) {
//     const params = {
//       app_id: this.appId,
//       charset: 'utf-8',
//       method: 'alipay.trade.page.pay',
//       sign_type: 'RSA2',
//       timestamp: new Date().toISOString().slice(0, 19),
//       version: '1.0',
//       notify_url: this.notifyUrl,
//       return_url: this.returnUrl,
//       biz_content: JSON.stringify({
//         out_trade_no: orderNo,
//         total_amount: totalAmount,
//         subject,
//         product_code: 'FAST_INSTANT_TRADE_PAY',
//       }),
//     };

//     const sign = this.rsaSign(params);
//     params.sign = sign;

//     const url = 'https://openapi.alipay.com/gateway.do?' + new URLSearchParams(params).toString();
//     return { payUrl: url };
//   }

//   rsaSign(obj) {
//     const str = Object.keys(obj)
//       .filter(k => obj[k] && k !== 'sign')
//       .sort()
//       .map(k => `${k}=${obj[k]}`)
//       .join('&');
//     return crypto.sign('RSA-SHA256', Buffer.from(str), this.privateKey).toString('base64');
//   }
// }