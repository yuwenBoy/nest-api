 import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WxPayService {
  private readonly appid = '你的公众号APPID';
  private readonly mchid = '微信商户号';
  private readonly key = '商户API密钥';
  private readonly notifyUrl = 'https://你的域名.com/order/pay/notify/wechat';

  // 微信H5统一下单
  async createH5Order(orderNo: string, totalFee: number, body: string, clientIp: string) {
    const nonce_str = Math.random().toString(36).slice(2, 15);

    const params = {
      appid: this.appid,
      mch_id: this.mchid,
      nonce_str,
      body,
      out_trade_no: orderNo,
      total_fee: totalFee, // 单位：分
      spbill_create_ip: clientIp,
      notify_url: this.notifyUrl,
      trade_type: 'MWEB', // H5支付固定写MWEB
    };

    // 签名
    const sign = this.generateSign(params);
    const xml = this.buildXml({ ...params, sign });

    // 请求微信下单接口
    const result = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      xml,
      { headers: { 'Content-Type': 'text/xml' } }
    );

    const res = await this.parseXml(result.data);
    // if (res.return_code === 'SUCCESS' && res.result_code === 'SUCCESS') {
    //   // 返回微信H5支付链接
    //   return {
    //     payUrl: res.mweb_url, // 前端直接跳转这个链接即可支付
    //   };
    // }
    throw new Error('微信下单失败');
  }

  // MD5 签名
  generateSign(obj: any): string {
    const keys = Object.keys(obj).sort();
    const str = keys
      .filter(k => obj[k] && k !== 'sign')
      .map(k => `${k}=${obj[k]}`)
      .join('&') + `&key=${this.key}`;
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  }

  // 拼接XML
  buildXml(obj: any): string {
    let xml = '<xml>';
    for (const k in obj) xml += `<${k}>${obj[k]}</${k}>`;
    xml += '</xml>';
    return xml;
  }

  // 解析XML
  async parseXml(xml: string) {
    const obj = {};
    xml.replace(/<(\w+)>([^<]+)<\/\1>/g, (_, k, v) => (obj[k] = v));
    return obj;
  }
}