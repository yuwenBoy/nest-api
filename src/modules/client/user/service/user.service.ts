import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/common/libs/redis/redis.service';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserProfileEntity } from 'src/entities/client/t_user_profile.entity';
import { UserTypeEnum, UserStatusEnum } from 'src/enum/admin_enum';
import {
  clientJwtContants,
  jwtContants,
  refreshExpiresIn,
} from 'src/modules/common/collections-permission/constants/jwtContants';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly redisService: RedisService, // ✅ 注入Redis

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly cProfileRepository: Repository<UserProfileEntity>,
    private readonly jwtService: JwtService, // ✅ 注入JWT
  ) {
    console.log('UserService 构造函数执行了');
  }

  /**
   * 生成并发送验证码
   */
  async sendSmsCode(phone: string): Promise<String> {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式错误');
    }

    const sentKey = `sms_sent:${phone}`;

    // ✅ 1. 使用 exists 检查键是否存在（不是 get）
    const exists = await this.redisService.exists(sentKey);
    console.log(`🔍 检查 ${sentKey} 是否存在:`, exists);
    // ✅ 2. 获取剩余过期时间
    const ttl = await this.redisService.ttl(sentKey);
    if (exists && ttl > 0) {
      console.log(`⏱️ TTL ${sentKey}:`, ttl, '秒');
      throw new BadRequestException(`请${ttl}秒后再试`);
    }
    //      // ✅ 4. TTL <= 0 说明已过期但键还在，删除它
    //    if (ttl <= 0) {
    //        await this.redisService.del(sentKey);
    //        console.log(`🗑️ 删除过期键 ${sentKey}`);
    //    }
    // ✅ 4. 如果到这里，说明可以发送（键不存在或已过期）
    console.log(`✅ 允许发送: 键不存在=${!exists}, TTL=${ttl}`);
    const code = Math.random().toString().slice(-4);
    const codeKey = `sms_code:${phone}`;

    // ✅ 5. 存储验证码（5分钟）
    await this.redisService.setex(codeKey, 300, code);
    console.log(`📤 写入 ${codeKey}: ${code} (300秒)`);

    // ✅ 6. 标记已发送（60秒）
    await this.redisService.setex(sentKey, 60, '1');
    console.log(`📤 写入 ${sentKey}: 1 (60秒)`);

    // ✅ 8. 调用短信服务商发送
    await this.sendSmsViaAliyun(phone, code);
    return code;
  }

  /**
   * 验证验证码
   */
  async validateCode(phone: string, code: string): Promise<boolean> {
    const key = `sms_code:${phone}`;
    const storedCode = await this.redisService.get(key);

    if (!storedCode) {
      throw new BadRequestException('验证码已过期');
    }

    if (storedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    // ✅ 验证通过后删除（防止重复使用）
    await this.redisService.del(key);
    return true;
  }

  /**
   * 调用阿里云短信服务（示例）
   */
  private async sendSmsViaAliyun(phone: string, code: string): Promise<void> {
    // 实际项目中使用阿里云SDK
    // const client = new SMSClient({...});
    // await client.sendSMS({...});

    // ✅ 开发环境：直接打印到控制台
    console.log(`📱 发送验证码到 ${phone}: ${code}`);

    // ✅ 测试环境：可以返回给前端（方便测试）
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧪 测试模式验证码: ${code}`);
    }
  }

  /**
   * ✅ 查询或创建用户（含扩展表）
   */
  async findOrCreate(
    phone: string,
  ): Promise<{ user: UserEntity; isNew: boolean }> {
    // 1. 先查主表
    let user = await this.userRepository.findOne({ where: { phone } });

    if (user) {
      // 用户存在，直接返回
      return { user, isNew: false };
    }

    // 2. 创建主表用户
    user = this.userRepository.create({
      phone,
      userType: UserTypeEnum.CLIENT, // ✅ 顾客类型
      disabled: UserStatusEnum.DISABLED, // ✅ 主表默认启用
      nick_name: `用户${phone.slice(-4)}`, // ✅ 主表存昵称
      avatar: '', // ✅ 主表存头像
    });
    user = await this.userRepository.save(user);
    console.log(`📝 创建主表用户: ${phone} (ID: ${user.id})`);

    // 3. 创建扩展表（关联主表ID）
    const profile = this.cProfileRepository.create({
      userId: user.id,
      points:0,
      balance:0,
      total_order:0,
      total_spent:0,
      lastLoginTime: new Date(), // ✅ 自动获取当前时间
      loginCount: 0,
    });
    await this.cProfileRepository.save(profile);
    console.log(`📝 创建扩展表记录: userId=${user.id}`);
    return { user, isNew: true };
  }


  /**
   * ✅ 更新最后登录时间和登录次数
   */
  async updateLoginStats(userId: number): Promise<void> {
    const profile = await this.cProfileRepository.findOne({ where: { userId } });

    if (profile) {
      // ✅ 1. 更新最后登录时间（当前时间）
      profile.lastLoginTime = new Date(); // ✅ 自动获取当前时间

      // ✅ 2. 登录次数 +1
      profile.loginCount += 1;

      // ✅ 3. 保存到数据库
      await this.cProfileRepository.save(profile);
      console.log(`✅ 更新登录统计: userId=${userId}, loginCount=${profile.loginCount}`);
    }
  }


  /**
   * ✅ 生成JWT Token
   */
  async generateToken(payload: {
    userId: number;
    phone: string;
    userType: number;
  }): Promise<string> {
    //   return this.jwtService.sign(
    //     {
    //       sub: payload.userId,
    //       phone: payload.phone,
    //       userType: payload.userType,
    //     },
    //     {
    //       expiresIn: '7d', // 7天过期
    //       secret: process.env.JWT_SECRET || 'your-secret-key',
    //     },
    //   );
    const accessToken = `Bearer ${this.jwtService.sign(
      {
        sub: payload.userId,
        phone: payload.phone,
        userType: payload.userType,
      },
      clientJwtContants,
    )}`;
    return accessToken
  }
}
