import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('t_operation_log')
export class OperationLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, nullable: false, comment: '操作人' })
  operator: string;

  @Column('varchar', { length: 10, nullable: false, comment: '操作类型' })
  operationType: string;

  @Column('varchar', { length: 255, nullable: false, comment: '操作内容' })
  operationContent: string;

  @Column('varchar', { length: 15, nullable: false, comment: '请求方法' })
  requestMethod: string;

  @Column('varchar', { length: 255, nullable: false, comment: '请求路径' })
  requestPath: string;

  @Column('json', { nullable: true, comment: '请求参数' })
  requestParams: any;

  @Column('varchar', { length: 45, nullable: true, comment: '客户端 IP' })
  clientIp: string;

  @Column('varchar', { length: 255, nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column('json', { nullable: true, comment: '操作后数据' })
  responseData: any;

  @CreateDateColumn({ comment: '操作时间' })
  operationTime: Date;

  @Column('int', { nullable: true, comment: '记录执行时间' })
  duration:number;
  
  @Column('json', { nullable: true, comment: '记录请求头' })
  requestHeaders: any;

  @Column('int', { nullable: true, comment: '状态码' })
  statusCode:number;

  @Column('int', { nullable: true, comment: '用户 ID' })
  userId:any;
  
  @Column('int', { nullable: true, comment: '用户 类型' })
  userType:number;

  @Column('int', { nullable: true, comment: '端类型' })
  appType:number;

  @Column('varchar', { nullable: true, comment: '业务 ID' })
  businessId:string;

  @Column('text', { nullable: true, comment: '错误堆栈' })
  errorStack: string;

  @Column('int', { nullable: true, comment: '日志等级' })
  logLevel:number
}