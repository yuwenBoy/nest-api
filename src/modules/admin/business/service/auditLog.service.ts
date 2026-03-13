import {
    BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessEntity } from 'src/entities/business/business.entity';
import {
  Connection,
  Repository,
} from 'typeorm';
import {
    AuditLogStatusEnum,
  StoreStatusEnum,
} from 'src/enum/business_enum';
import { BusinessCategoryRelationEntity } from 'src/entities/business/business_category_relation.entity';
import { PageListVo } from 'src/modules/common/page/pageList';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { StoreEntity } from 'src/entities/store/store.entity';
import { AuditLogEntity } from 'src/entities/business/audit_log.entity';
import { AuditRejectDto } from '../dto/AuditRejectDto';

@Injectable()
export class AuditLogService {
  constructor(

    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
    @InjectConnection() // 核心：添加这个装饰器
    private readonly connection: Connection, 
 
  ) {}
 

  /**
   * 审核管理列表
   * @param parameter 
   * @returns 
   */
  async pageAuditLogQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = this.auditLogRepository
        .createQueryBuilder('audit')
        .leftJoinAndMapOne(
          'audit.applicant',
          UserEntity,
          'user',
          'audit.applicantId = user.id',
        )
         .leftJoinAndMapOne(
          'audit.operator',
          UserEntity,
          'user1',
          'audit.operatorId = user1.id', 
        )
        // 2. 根据目标类型（1=商家/2=门店/3=骑手）动态关联目标表
        .leftJoin(
          // 动态判断关联的实体表
          parameter.targetType === 1
            ? BusinessEntity
            : parameter.targetType === 2
            ? StoreEntity
            : UserEntity, // 替换为你的骑手实体类路径
          'target', // 统一别名：target
          'audit.targetId = target.id', // 目标ID关联：audit.target_id = 目标表.id
        )
        // 3. 映射目标数据到audit对象（区分类型）
        .leftJoinAndMapOne(
          'audit.business', // 商家数据映射到audit.business
          BusinessEntity,
          'business',
          'audit.targetType = 1 AND audit.targetId = business.id',
        )
        .leftJoinAndMapOne(
          'audit.store', // 门店数据映射到audit.store
          StoreEntity,
          'store',
          'audit.targetType = 2 AND audit.targetId = store.id',
        )
        .leftJoinAndMapOne(
          'audit.rider', // 骑手数据映射到audit.rider
          UserEntity,
          'rider',
          'audit.targetType = 3 AND audit.targetId = rider.id',
        )
        // 原有商家分类关联（仅商家类型生效）
        .leftJoinAndMapMany(
          'audit.businessCategoryRelation',
          BusinessCategoryRelationEntity,
          'bc',
          'audit.targetType = 1 AND audit.targetId = bc.business_id',
        )
        .where(parameter.status ? 'audit.status = :status':'', { status: parameter.status || 0 })
        // 新增：目标类型筛选
        .andWhere(
          parameter.targetType ? 'audit.targetType = :targetType' : '1=1',
          {
            targetType: parameter.targetType,
          },
        )
        // 新增：申请人ID筛选
        .andWhere(
          parameter.applicantId ? 'audit.applicantId = :applicantId' : '1=1',
          {
            applicantId: parameter.applicantId,
          },
        )
        // 原有商家名称模糊查询（适配目标类型）
        // .andWhere(
        //   new Brackets((qb) => {
        //     if (parameter.title) {
        //       // 商家/门店名称分别匹配
        //       return qb
        //         .orWhere('audit.target_type = 1 AND business.title LIKE :title', { title: `%${parameter.title}%` })
        //         .orWhere('audit.target_type = 2 AND store.name LIKE :title', { title: `%${parameter.title}%` });
        //     } else {
        //       return qb;
        //     }
        //   }),
        // )
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

  
  // 获取审核记录详情
  async auditLogDetail(id: number) {
    try {
      // 1. 查询审核主记录
      const audit = await this.auditLogRepository
        .createQueryBuilder('audit')
        // 关联申请人（用户表）
        .leftJoinAndMapOne(
          'audit.applicant',
          UserEntity,
          'user',
          'audit.applicantId = user.id',
        )
        // 关联审核人（操作人）
        .leftJoinAndMapOne(
          'audit.operator',
          UserEntity,
          'operator',
          'audit.operatorId = operator.id',
        )
        // 根据目标类型关联商家/门店
        .leftJoinAndMapOne(
          'audit.business',
          BusinessEntity,
          'business',
          'audit.targetType = 1 AND audit.targetId = business.id',
        )
        .leftJoinAndMapOne(
          'audit.store',
          StoreEntity,
          'store',
          'audit.targetType = 2 AND audit.targetId = store.id',
        )
        .where('audit.id = :id', { id })
        .getOne();

      if (!audit) {
        throw new HttpException('审核记录不存在', HttpStatus.NOT_FOUND);
      }

      // 2. 格式化数据（如时间、状态文本）
      return {
        ...audit,
        // 状态文本
        statusText:
          audit.status === 0
            ? '待审核'
            : audit.status === 1
            ? '审核通过'
            : '审核驳回',
        // 格式化时间
        createdAt: audit.createdAt ? this.formatDate(audit.createdAt) : '-',
        auditAt: audit.auditAt ? this.formatDate(audit.auditAt) : '-',
        // // 申请人/审核人名称（兜底）
        // applicantName: audit.applicant?.name || '-',
        // operatorName: audit.operator?.name || '-',
      };
    } catch (error) {
      Logger.error(`查询审核详情失败：${error.message}`);
      throw new HttpException(
        '查询审核详情失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // 辅助方法：时间格式化
  private formatDate(date: Date) {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  
  /**
   * 审核驳回接口（匹配前端调用参数）
   * @param dto 前端传入的auditId + rejectReason
   * @param operatorId 操作人ID（可从token解析，这里先作为参数传入）
   */
  async rejectAuditLog(dto: AuditRejectDto, operatorId: number) {
    // 开启事务，确保审核记录和门店状态更新原子性
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { auditId, rejectReason } = dto;  

      // 1. 查询审核记录，校验状态
      const auditLog = await queryRunner.manager.findOne(AuditLogEntity, {
        where: { id: auditId },
      });

      if (!auditLog) {
        throw new NotFoundException(`审核记录ID: ${auditId} 不存在`);
      }

      // 只能驳回「审核中」的记录
      if (auditLog.status !== 0) { // 假设auditLog的status：0=审核中，1=已通过，2=已驳回
        throw new BadRequestException(`审核记录ID: ${auditId} 当前状态不是「审核中」，无法驳回`);
      }

      // 2. 查询关联门店
      const store = await queryRunner.manager.findOne(StoreEntity, {
        where: { id: auditLog.targetId }, // 审核记录关联门店ID
      });

      if (!store) {
        throw new NotFoundException(`审核记录关联的门店ID: ${auditLog.targetId} 不存在`);
      }

      // 3. 更新审核记录（标记驳回 + 存储结构化驳回原因）
      auditLog.status = AuditLogStatusEnum.REJECTED; // 审核驳回
      auditLog.reason = JSON.stringify(rejectReason); // 存储前端传入的结构化驳回原因
      auditLog.operatorId = operatorId; // 操作人ID
      auditLog.auditAt = new Date(); // 审核时间
      await queryRunner.manager.save(AuditLogEntity, auditLog);

      store.status = StoreStatusEnum.AUDIT_REJECTED;

      await queryRunner.manager.save(StoreEntity, store);

      // 提交事务
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `审核记录ID: ${auditId} 驳回成功`,
        data: {
          auditId,
          storeId: store.id,
          storeStatus: store.status,
          rejectReason,
        },
      };
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error; // 抛出异常让全局过滤器处理
    } finally {
      // 释放连接
      await queryRunner.release();
    }
  }
}
