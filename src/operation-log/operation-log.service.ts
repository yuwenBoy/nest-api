// src/operation-log/operation-log.service.ts
import * as cheerio from 'cheerio';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { OperationLogEntity } from '../entities/admin/t_operation_log.entity';
import { PageListVo } from '../modules/common/page/pageList';
import { Like, Repository, And, Brackets } from 'typeorm';
import { formatDate } from '../utils/date'

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLogEntity)
    private readonly logRepository: Repository<OperationLogEntity>,
  ) {}

  async save(log: OperationLogEntity) {
    await this.logRepository.save(log);
  }

  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = await this.logRepository
        .createQueryBuilder('log')
        .where(
          new Brackets((qb) => {
            if (parameter.userName) {
              qb.andWhere('log.requestPath LIKE :requestPath', {
                requestPath: `%${parameter.requestPath}%`,
              });
            }
            if (parameter.requestMethod) {
              qb.andWhere('log.requestMethod LIKE :requestMethod', {
                requestMethod: parameter.requestMethod,
              });
            }
          }),
        )
        .orderBy(`log.id`, 'DESC')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize);

      const [data, count] = await qb.getManyAndCount();

      return {
        ...{ content: data },
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      Logger.error(`查询分页列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '查询分页列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //     /**
  //      * 查询员工信息分页列表
  //      * @param parameter 查询条件
  //      * @returns list
  //      */
  //     async pageQuery(parameter: any): Promise<PageListVo> {
  //       try {
  //           const [pageIndex, pageSize] = [parameter.page, parameter.size];
  //           let find_object = {
  //             where: [],
  //             order: {},
  //             skip: (pageIndex - 1) * Number(pageSize), // 分页，跳过几项
  //             take: pageSize, // 分页，取几项
  //             cache: false,
  //           };
  //           if (parameter.requestPath) {
  //             find_object.where.push({ requestPath: Like(`%${parameter.requestPath}%`) });
  //           }
  //           if (parameter.requestMethod) {
  //             find_object.where.push(
  //               { requestMethod:parameter.requestMethod}
  //             );
  //           }
  //         // 如果没有任何条件，删除 where 属性
  // if (find_object.where.length === 0) {
  //     delete find_object.where;
  //   }

  //   console.log("find_object",find_object);
  //           if (parameter.sort) find_object.order[parameter.sort] = 'DESC';

  //           const data = { content: await this.logRepository.find(find_object) };

  //           // 总条数
  //           const count = await this.logRepository.count({
  //             where: find_object.where,
  //           });

  //           return {
  //             ...data,
  //             page: pageIndex,
  //             size: pageSize,
  //             totalPage: Math.ceil(count / pageSize),
  //             totalElements: count,
  //           };
  //         } catch (error) {
  //           Logger.log(`查询【员工信息分页列表】请求失败：${JSON.stringify(error)}`);
  //         }
  //     }

  /****
   * 爬取国家统计局区县和街道数据 默认查询江苏省
   * @param level = 1 第一级省 level = 2 第二级市 level = 3 区县 level = 4 街道
   *
   */
  async getCityList(id: string, level: number): Promise<any> {
    try {
      let request_url = `https://www.stats.gov.cn/sj/tjbz/tjyqhdmhcxhfdm/2023/${id}`;
      console.log('进来了吗？');
      let element = '';
      if (level == 2) {
        element = '.citytable tr';
      }
      if (level == 3) {
        element = '.countytable tr';
      }
      if (level == 4) {
        element = '.towntable tr';
      }

      console.log('请求前' + request_url);
      // 使用axios发送get请求
      const response = await axios.get(request_url);
      console.log('请求后');
      let list = [];
      const $ = cheerio.load(response.data);
      Logger.log('看一下$' + $);
      let filter_index = level == 3 ? 1 : 0;
      $(await element).each(function (i, v) {
        Logger.log('看一下v' + v);
        let _city = {
          id: '',
          name: '',
          href: '',
          level: 0,
        };
        if (i > filter_index) {
          _city.id = $(v).find('td').eq(0).text();
          _city.name = $(v).find('td').eq(1).text();
          _city.href = $(v).find('td').eq(1).find('a').attr('href');
          _city.level = level; // 当前级别
          list.push(_city);
        }
      });
      Logger.log('打印一下结果===============' + list);
      return list;
    } catch (err) {
      Logger.log('报错了吗?************' + err);
    }
  }

  /***
   * 查询国家统计局部分城市数据
   *
   */
  async getCityInfo() {
    try {
      const list = this.getCityList('32/3206.html', 3); // 查询江苏省--南通市下的区县和街道     默认查询
      Logger.log('打印一下list' + list);
      const promise = (await list).map(async (item) => {
        let pid;
        if (item.level == 2) {
          pid = item.href;
        }
        if (item.level == 3) {
          pid = item.id.toString().substring(0, 2) + '/' + item.href;
        }
        const itemData = await this.getCityList(pid, item.level + 1);
        return { ...item, children: itemData };
      });
      const result = await Promise.all(promise);
      return result;
    } catch (err) {
      Logger.error('报错了，原因' + err);
    }
  }

  /**
   * 在线日志查询
   * @param parameter 查询条件
   * @returns PageListVo
   */
  async getOnlineLogs(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page || 1, parameter.size || 10];
      let qb = this.logRepository
        .createQueryBuilder('log')
        .where('log.logLevel = :logLevel', { logLevel: 1 }); // 只查询正常日志（logLevel=1）

      // 添加时间范围过滤
      if (parameter.startTime) {
        qb.andWhere('log.operationTime >= :startTime', {
          startTime: new Date(parameter.startTime),
        });
      }
      if (parameter.endTime) {
        qb.andWhere('log.operationTime <= :endTime', {
          endTime: new Date(parameter.endTime),
        });
      }

      // 添加操作人过滤
      if (parameter.operator) {
        qb.andWhere('log.operator LIKE :operator', {
          operator: `%${parameter.operator}%`,
        });
      }

      // 添加请求路径过滤
      if (parameter.requestPath) {
        qb.andWhere('log.requestPath LIKE :requestPath', {
          requestPath: `%${parameter.requestPath}%`,
        });
      }

      // 添加请求方法过滤
      if (parameter.requestMethod) {
        qb.andWhere('log.requestMethod = :requestMethod', {
          requestMethod: parameter.requestMethod,
        });
      }

      // 添加用户ID过滤
      if (parameter.userId) {
        qb.andWhere('log.userId = :userId', { userId: parameter.userId });
      }

      // 添加端类型过滤
      if (parameter.appType) {
        qb.andWhere('log.appType = :appType', { appType: parameter.appType });
      }

      // 添加在线状态过滤
      if (parameter.status) {
        qb.andWhere('log.status = :status', { status: parameter.status });
      }

      // 添加用户名过滤
      if (parameter.username) {
        qb.andWhere('log.username LIKE :username', {
          username: `%${parameter.username}%`,
        });
      }

      // 排序处理
      const sortField = parameter.sort || 'operationTime';
      const sortColumn = sortField === 'id' ? 'log.id' : `log.${sortField}`;

      const [data, count] = await qb
        .orderBy(sortColumn, 'DESC')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize)
        .getManyAndCount();

      return {
        content: data,
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      Logger.error(`查询在线日志列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '查询在线日志列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 异常日志查询
   * @param parameter 查询条件
   * @returns PageListVo
   */
  async getExceptionLogs(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page || 1, parameter.size || 10];
      let qb = this.logRepository.createQueryBuilder('log').where(
        new Brackets((qb) => {
          // 查询异常日志：logLevel >= 2 或 statusCode != 0 或有错误堆栈
          qb.where('log.logLevel >= :logLevel', { logLevel: 2 })
            .orWhere('log.statusCode != :statusCode', { statusCode: 0 })
            .orWhere('log.errorStack IS NOT NULL');
        }),
      );

      // 添加时间范围过滤
      if (parameter.startTime) {
        qb.andWhere('log.operationTime >= :startTime', {
          startTime: new Date(parameter.startTime),
        });
      }
      if (parameter.endTime) {
        qb.andWhere('log.operationTime <= :endTime', {
          endTime: new Date(parameter.endTime),
        });
      }

      // 添加操作人过滤
      if (parameter.operator) {
        qb.andWhere('log.operator LIKE :operator', {
          operator: `%${parameter.operator}%`,
        });
      }

      // 添加请求路径过滤
      if (parameter.requestPath) {
        qb.andWhere('log.requestPath LIKE :requestPath', {
          requestPath: `%${parameter.requestPath}%`,
        });
      }

      // 添加请求方法过滤
      if (parameter.requestMethod) {
        qb.andWhere('log.requestMethod = :requestMethod', {
          requestMethod: parameter.requestMethod,
        });
      }

      // 添加用户ID过滤
      if (parameter.userId) {
        qb.andWhere('log.userId = :userId', { userId: parameter.userId });
      }

      // 添加端类型过滤
      if (parameter.appType) {
        qb.andWhere('log.appType = :appType', { appType: parameter.appType });
      }

      // 添加日志级别过滤
      if (parameter.logLevel) {
        qb.andWhere('log.logLevel = :logLevel', {
          logLevel: parameter.logLevel,
        });
      }

      // 添加状态码过滤
      if (parameter.statusCode) {
        qb.andWhere('log.statusCode = :statusCode', {
          statusCode: parameter.statusCode,
        });
      }

      const [data, count] = await qb
        .orderBy('log.operationTime', 'DESC')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize)
        .getManyAndCount();

      return {
        content: data,
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      Logger.error(`查询异常日志列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '查询异常日志列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取在线用户列表
   * @param parameter 查询条件
   * @returns 在线用户列表
   */
  async getOnlineUserList(parameter: any): Promise<any> {
    try {
      // 从 chatGateway 获取在线用户数据
      const ChatGateway = require('../gateway/chat.gateway').ChatGateway;
      const onlineUsers: Map<
        number,
        {
          socketId: string;
          status: string;
          ip: string;
          username: string;
          cname: string;
          location: string;
          browser: string;
          os: string;
          loginTime: Date;
          lastActiveTime: Date;
        }
      > = ChatGateway.onlineUsers;

      let userList = [];
      onlineUsers.forEach((userInfo, userId) => {
        userList.push({
          userId,
          ip: userInfo.ip,
          socketId: userInfo.socketId,
          status: userInfo.status,
          username: userInfo.username,
          cname: userInfo.cname,
          location: userInfo.location,
          browser: userInfo.browser,
          os: userInfo.os,
          loginTime: userInfo.loginTime ? formatDate(userInfo.loginTime) : formatDate(new Date()),
          lastActiveTime: userInfo.lastActiveTime ? formatDate(userInfo.lastActiveTime) : formatDate(new Date()),
        });
      });

      // 根据状态过滤
      if (parameter.status) {
        userList = userList.filter(item => item.status === parameter.status);
      }

      // 根据用户名过滤（模糊匹配）
      if (parameter.username) {
        const username = parameter.username.toLowerCase();
        userList = userList.filter(item => 
          item.username.toLowerCase().includes(username) || 
          item.cname.toLowerCase().includes(username)
        );
      }

      // 根据IP地址过滤（模糊匹配）
      if (parameter.ip) {
        const ip = parameter.ip.toLowerCase();
        userList = userList.filter(item => 
          item.ip.toLowerCase().includes(ip)
        );
      }

      // 分页
      const pageIndex = parameter.page || 1;
      const pageSize = parameter.size || 10;
      const start = (pageIndex - 1) * pageSize;
      const end = start + pageSize;
      const pagedData = userList.slice(start, end);

      return {
        content: pagedData,
        page: pageIndex,
        size: pageSize,
        totalElements: userList.length,
        totalPage: Math.ceil(userList.length / pageSize),
      };
    } catch (error) {
      Logger.error(`获取在线用户列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取在线用户列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 强制用户下线
   * @param params 包含 userId
   * @returns 操作结果
   */
  async kickUser(params: any): Promise<any> {
    try {
      const { userId } = params;
      const ChatGateway = require('../gateway/chat.gateway').ChatGateway;
      const onlineUsers: Map<number, { socketId: string; status: string }> =
        ChatGateway.onlineUsers;

      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        Logger.log(`用户 ${userId} 已被强制下线`);
        return { success: true, message: '用户已被强制下线' };
      }
      return { success: false, message: '用户不在线' };
    } catch (error) {
      Logger.error(`强制用户下线失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '强制用户下线失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户操作日志
   * @param parameter 包含 userId
   * @returns 操作日志列表
   */
  async getUserOperLog(parameter: any): Promise<PageListVo> {
    try {
      const { userId, page = 1, size = 10 } = parameter;

      let qb = this.logRepository
        .createQueryBuilder('log')
        .where('log.userId = :userId', { userId });

      // 时间范围过滤
      if (parameter.startTime) {
        qb.andWhere('log.operationTime >= :startTime', {
          startTime: new Date(parameter.startTime),
        });
      }
      if (parameter.endTime) {
        qb.andWhere('log.operationTime <= :endTime', {
          endTime: new Date(parameter.endTime),
        });
      }

      const [data, count] = await qb
        .orderBy('log.operationTime', 'DESC')
        .skip((page - 1) * Number(size))
        .take(size)
        .getManyAndCount();

      return {
        content: data,
        page,
        size,
        totalElements: count,
        totalPage: Math.ceil(count / size),
      };
    } catch (error) {
      Logger.error(`获取用户操作日志失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取用户操作日志失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 强制多人下线
   * @param params 包含 userIds 数组
   * @returns 操作结果
   */
  async kickUsers(params: any): Promise<any> {
    try {
      const { userIds } = params;
      const ChatGateway = require('../gateway/chat.gateway').ChatGateway;
      const onlineUsers: Map<number, { socketId: string; status: string }> =
        ChatGateway.onlineUsers;

      const kickedUsers = [];
      for (const userId of userIds) {
        if (onlineUsers.has(userId)) {
          onlineUsers.delete(userId);
          kickedUsers.push(userId);
        }
      }

      Logger.log(`批量下线用户：${kickedUsers.join(', ')}`);
      return {
        success: true,
        message: `${kickedUsers.length} 个用户已被强制下线`,
        kickedUsers,
      };
    } catch (error) {
      Logger.error(`强制多人下线失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '强制多人下线失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取异常日志列表
   * @param parameter 查询条件
   * @returns 异常日志列表
   */
  async getErrorLogList(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page || 1, parameter.size || 10];
      let qb = this.logRepository.createQueryBuilder('log').where(
        new Brackets((qb) => {
          qb.where('log.logLevel >= :logLevel', { logLevel: 2 })
            .orWhere('log.statusCode != :statusCode', { statusCode: 0 })
            .orWhere('log.errorStack IS NOT NULL');
        }),
      );

      // 过滤条件
      if (parameter.startTime) {
        qb.andWhere('log.operationTime >= :startTime', {
          startTime: new Date(parameter.startTime),
        });
      }
      if (parameter.endTime) {
        qb.andWhere('log.operationTime <= :endTime', {
          endTime: new Date(parameter.endTime),
        });
      }
      if (parameter.operator) {
        qb.andWhere('log.operator LIKE :operator', {
          operator: `%${parameter.operator}%`,
        });
      }

      const [data, count] = await qb
        .orderBy('log.operationTime', 'DESC')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize)
        .getManyAndCount();

      return {
        content: data,
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      Logger.error(`获取异常日志列表失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取异常日志列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取异常日志详情
   * @param id 日志ID
   * @returns 日志详情
   */
  async getErrorLogDetail(id: string): Promise<any> {
    try {
      const log = await this.logRepository
        .createQueryBuilder('log')
        .where('log.id = :id', { id })
        .getOne();

      if (!log) {
        throw new HttpException('日志不存在', HttpStatus.NOT_FOUND);
      }
      return log;
    } catch (error) {
      Logger.error(`获取异常日志详情失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取异常日志详情失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除异常日志
   * @param params 包含 ids 数组
   * @returns 操作结果
   */
  async delErrorLog(params: any): Promise<any> {
    try {
      const { ids } = params;
      const result = await this.logRepository.delete(ids);
      Logger.log(`删除异常日志，数量：${ids.length}`);
      return {
        success: true,
        message: '删除成功',
        deletedCount: result.affected,
      };
    } catch (error) {
      Logger.error(`删除异常日志失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '删除异常日志失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取在线统计数据
   * @returns 统计数据
   */
  async getOnlineStats(): Promise<any> {
    try {
      // 获取在线人数
      const ChatGateway = require('../gateway/chat.gateway').ChatGateway;
      const onlineUsers: Map<number, any> = ChatGateway.onlineUsers || new Map();
      const onlineCount = onlineUsers.size;

      // 获取今日登录用户数（根据请求路径判断登录操作，按用户ID去重）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLoginResult = await this.logRepository
        .createQueryBuilder('log')
        .select('COUNT(DISTINCT log.userId)', 'count')
        .where('log.operationTime >= :today', { today })
        .andWhere(
          '(log.requestPath LIKE :login OR log.requestPath LIKE :auth)',
          { 
            login: '%/login%', 
            auth: '%/auth%' 
          }
        )
        .getRawOne();
      const todayLoginCount = parseInt(todayLoginResult?.count || '0', 10);

      // 获取总记录数
      const totalCount = await this.logRepository.count();

      // 获取历史峰值（从在线日志中统计最大在线人数）
      // 这里简化处理，直接取在线人数作为参考值
      // 如果需要真实的历史峰值，需要额外存储峰值记录
      const historyPeak = onlineCount; // 实际项目中应该从历史记录中查询

      return {
        onlineCount,
        todayLoginCount,
        totalCount,
        historyPeak,
      };
    } catch (error) {
      Logger.error(`获取在线统计数据失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '获取在线统计数据失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 清空异常日志
   * @returns 操作结果
   */
  async clearErrorLog(): Promise<any> {
    try {
      const result = await this.logRepository
        .createQueryBuilder()
        .delete()
        .where('logLevel >= :logLevel', { logLevel: 2 })
        .orWhere('statusCode != :statusCode', { statusCode: 0 })
        .orWhere('errorStack IS NOT NULL')
        .execute();

      Logger.log(`清空异常日志，数量：${result.affected}`);
      return {
        success: true,
        message: '清空成功',
        deletedCount: result.affected,
      };
    } catch (error) {
      Logger.error(`清空异常日志失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '清空异常日志失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 导出异常日志
   * @param params 导出条件
   * @param res 响应对象
   */
  async exportErrorLog(params: any, res: any): Promise<any> {
    try {
      const logs = await this.getErrorLogList({
        ...params,
        page: 1,
        size: 10000,
      });
      const jsonStr = JSON.stringify(logs.content, null, 2);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=error-log-${Date.now()}.json`,
      );
      res.send(jsonStr);
    } catch (error) {
      Logger.error(`导出异常日志失败，原因：${JSON.stringify(error)}`);
      throw new HttpException(
        '导出异常日志失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
