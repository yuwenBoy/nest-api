// src/common/services/ip-geolocation.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IpGeolocationService {
  private apiKey = 'YOUR_API_KEY'; // 替换为你的 IPinfo API 密钥

  async getGeolocation(ip: string): Promise<any> {
    try {
      const response = await axios.get(`https://ipinfo.io/${ip}/json?token=${this.apiKey}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching geolocation data:', error);
      return null;
    }
  }
}
