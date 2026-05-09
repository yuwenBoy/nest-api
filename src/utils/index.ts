
import { Socket } from 'socket.io';
import axios from 'axios';

/**
 * 获取客户端真实 IP
 */
export function getClientIp(client: Socket): string {
  const req = client.handshake;

  let ip =
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    client.conn.remoteAddress ||
    '0.0.0.0';

  if (Array.isArray(ip)) {
    ip = ip[0];
  }

  return ip.split(',')[0].trim();
}

/**
 * 根据 IP 获取所在城市
 */
export async function getIpLocation(ip: string): Promise<string> {
   try {
    // 处理空IP或无效IP
    if (!ip || ip.trim() === '') {
      return '未知位置';
    }

    // 提取真实IP（处理IPv6映射的IPv4地址）
    let realIp = ip;
    if (realIp.startsWith('::ffff:')) {
      realIp = realIp.substring(7); // 去掉 "::ffff:" 前缀
    }

    // 局域网本地IP直接返回
    if (
      realIp.startsWith('127.') 
      || realIp.startsWith('192.168') 
      || realIp.startsWith('10.') 
      || realIp === '::1'
      || realIp === 'localhost'
    ) {
      return '局域网';
    }

    // 👉 用这个稳定接口
    const res = await axios.get(`https://api.vore.top/api/IPdata?ip=${realIp}`);
    
    const data = res.data;
    if (data.code === 200) {
      const province = data.ipdata.province || '';
      const city = data.ipdata.city || '';
      return `${province} ${city}`.trim() || '未知位置';
    }

    return '未知位置';
  } catch (err) {
    console.log('IP定位异常:', err);
    return '获取位置失败';
  }
}

export const toTableTree = (arr, pid) => {
  return arr.reduce((res, current) => {
    if (current['parent_id'] == pid) {
      current['children'] = toTableTree(arr, current['id']);
      if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
        current['children'] = undefined;
      }
      return res.concat(current);
    }
    return res;
  }, []);  
};  

 