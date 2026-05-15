import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('IP定位模块')
@Controller('ip')
export class IpLocationController {
  private readonly GAODE_KEY = '8636947b22d1f182f12d6d364cf250cc';

  @Post('ipLocation')
  @HttpCode(HttpStatus.OK)
  async getIpLocation(@Body() body?: { ip?: string; lat?: number; lng?: number }) {
    const { ip, lat: inputLat, lng: inputLng } = body || {};
    try {
      // 用于存储省市区信息
      let province = '';
      let city = '';
      let district = '';
      let adcode = '';
      let rectangle = '';
      
      // 1. 优先使用传入的GPS坐标，否则使用IP定位
      let centerLat = inputLat;
      let centerLng = inputLng;
      
      if (!centerLat || !centerLng) {
        // 通过IP定位获取大致位置
        const ipUrl = 'https://restapi.amap.com/v3/ip';
        const ipParams: any = {
          key: this.GAODE_KEY,
          output: 'json',
        };
        
        if (ip) {
          ipParams.ip = ip;
        }
        
        const ipResponse = await axios.get(ipUrl, { params: ipParams });
        const ipData = ipResponse.data;
        
        if (ipData.status !== '1') {
          return {
            success: false,
            message: `IP定位失败: ${ipData.info}`,
          };
        }
        
        province = ipData.province;
        city = ipData.city;
        district = ipData.district;
        adcode = ipData.adcode;
        rectangle = ipData.rectangle;
        
        // 从rectangle解析中心点坐标
        centerLat = 39.9042; // 默认北京天安门纬度
        centerLng = 116.4074; // 默认北京天安门经度
        
        if (ipData.rectangle) {
          const coords = ipData.rectangle.split(';');
          if (coords.length === 2) {
            const [lng1, lat1] = coords[0].split(',').map(Number);
            const [lng2, lat2] = coords[1].split(',').map(Number);
            // 计算中心点坐标
            centerLat = (lat1 + lat2) / 2;
            centerLng = (lng1 + lng2) / 2;
          }
        }
      }
      
      // 3. 使用逆地理编码获取详细地址
      let detailAddress = '';
      let street = '';
      let building = '';
      let neighborhood = '';
      
      try {
        const regeoUrl = 'https://restapi.amap.com/v3/geocode/regeo';
        const regeoParams = {
          key: this.GAODE_KEY,
          location: `${centerLng},${centerLat}`,
          output: 'json',
          radius: 1000,
          extensions: 'all',
        };
        
        const regeoResponse = await axios.get(regeoUrl, { params: regeoParams });
        const regeoData = regeoResponse.data;
        
        if (regeoData.status === '1' && regeoData.regeocode) {
          const regeocode = regeoData.regeocode;
          
          // 获取格式化地址
          detailAddress = regeocode.formatted_address || '';
          
          // 获取街道信息
            if (regeocode.addressComponent) {
              const addressComponent = regeocode.addressComponent;
              street = addressComponent.street || addressComponent.township || '';
              
              // 如果是GPS定位，从逆地理编码结果获取省市区
              if (inputLat && inputLng) {
                province = addressComponent.province || '';
                city = Array.isArray(addressComponent.city) ? addressComponent.city[0] || '' : (addressComponent.city || '');
                // 对于直辖市，city可能为空，使用province作为city
                if (!city && province) {
                  city = province;
                }
                district = addressComponent.district || '';
                adcode = addressComponent.adcode || '';
              }
              
              // 获取小区/楼栋信息
              if (regeocode.pois && regeocode.pois.length > 0) {
                // 优先选择类型为小区、大厦、楼栋的POI
                const filteredPois = regeocode.pois.filter((poi: any) => {
                  const type = poi.type || '';
                  return type.includes('小区') || type.includes('大厦') || 
                         type.includes('公寓') || type.includes('楼') ||
                         type.includes('园区') || type.includes('广场');
                });
                
                if (filteredPois.length > 0) {
                  building = filteredPois[0].name || '';
                } else if (regeocode.pois[0]) {
                  building = regeocode.pois[0].name || '';
                }
              }
              
              // 获取社区/邻里信息
              neighborhood = addressComponent.neighborhood || addressComponent.community || '';
            }
        }
      } catch (regeoError) {
        console.warn('逆地理编码失败:', regeoError);
        // 逆地理编码失败不影响主流程
      }
      
      // 4. 组合最终地址
      let finalAddress = '';
      if (building) {
        finalAddress = building;
      } else if (neighborhood) {
        finalAddress = neighborhood;
      } else if (street) {
        finalAddress = street;
      } else if (district) {
        finalAddress = district;
      }
      
      // 如果有详细地址，补充省市区
      if (detailAddress && !finalAddress) {
        finalAddress = detailAddress;
      }
      
      return {
        success: true,
        province: province,
        city: city,
        district: district,
        adcode: adcode,
        rectangle: rectangle,
        latitude: centerLat,
        longitude: centerLng,
        street: street,
        neighborhood: neighborhood,
        building: building,
        address: finalAddress || `${city}${district || ''}`,
        formatted_address: detailAddress,
      };
    } catch (error) {
      console.error('IP定位请求失败:', error);
      return {
        success: false,
        message: 'IP定位服务异常',
      };
    }
  }

  /**
   * 地址搜索接口
   * @param keyword 搜索关键词
   * @param city 城市名
   */
  @Post('searchAddress')
  @HttpCode(HttpStatus.OK)
  async searchAddress(@Body() body: { keyword: string; city?: string }) {
    const { keyword, city } = body;
    
    if (!keyword || keyword.trim().length < 2) {
      return {
        success: false,
        message: '关键词长度不能少于2个字符',
      };
    }
    
    try {
      const url = 'https://restapi.amap.com/v3/place/text';
      const params: any = {
        key: this.GAODE_KEY,
        keywords: keyword.trim(),
        output: 'json',
        page: 1,
        offset: 20,
      };
      
      if (city) {
        params.city = city;
      }
      
      const response = await axios.get(url, { params });
      const data = response.data;
      
      if (data.status === '1' && data.pois && data.pois.length > 0) {
        const results = data.pois.map((poi: any) => ({
          name: poi.name || '',
          address: poi.address || '',
          formatted_address: poi.address || '',
          type: poi.type || 'community',
          lat: parseFloat(poi.location?.split(',')[1]) || null,
          lng: parseFloat(poi.location?.split(',')[0]) || null,
          latitude: parseFloat(poi.location?.split(',')[1]) || null,
          longitude: parseFloat(poi.location?.split(',')[0]) || null,
          adcode: poi.adcode || '',
          cityname: poi.cityname || '',
          adname: poi.adname || '',
        }));
        
        return {
          success: true,
           ...results,
        };
      } else {
        return {
          success: true,
          ...[],
          message: data.info || '未找到匹配的地址',
        };
      }
    } catch (error) {
      console.error('地址搜索失败:', error);
      return {
        success: false,
        message: '地址搜索服务异常',
      };
    }
  }
}
