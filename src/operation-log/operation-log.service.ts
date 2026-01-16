import cheerio from 'cheerio';
// src/operation-log/operation-log.service.ts
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { OperationLogEntity } from 'src/entities/admin/t_operation_log.entity';
import { PageListVo } from 'src/modules/common/page/pageList';
import { Like, Repository, And, Brackets } from 'typeorm';

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
                              requestMethod:parameter.requestMethod,
                            });
                          }
                    }),
                  ).orderBy(`log.id`, 'DESC')
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
            throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
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
  async getCityList(id:string,level:number): Promise<any> {
    try{
        let request_url = `https://www.stats.gov.cn/sj/tjbz/tjyqhdmhcxhfdm/2023/${id}`;  
        console.log('进来了吗？');
        let element = '';
        if(level==2){
            element = '.citytable tr';
        }if(level==3){
            element = '.countytable tr'
        }if(level==4){
            element = '.towntable tr'
        }
   
        console.log('请求前'+request_url)
       // 使用axios发送get请求
       const response = await axios.get(request_url);
       console.log('请求后')
       let list = [];
       const $ = cheerio.load(response.data);
       Logger.log('看一下$'+$);
       let filter_index = level == 3?1:0;
       $(await element).each(function(i,v){
           Logger.log('看一下v'+v);
           let _city ={
               id:'',
               name:'',href:'',level:0,
           };
           if(i>filter_index){
               _city.id = $(v).find('td').eq(0).text();
               _city.name = $(v).find('td').eq(1).text();
               _city.href = $(v).find('td').eq(1).find('a').attr('href');
               _city.level = level; // 当前级别
               list.push(_city);
           }
       });
       Logger.log('打印一下结果==============='+list)
       return list;
    }catch(err){
        Logger.log('报错了吗?************'+err)
    }
 }

 /***
  * 查询国家统计局部分城市数据
  * 
  */
  async getCityInfo() {
    try {
      const list = this.getCityList('32/3206.html',3); // 查询江苏省--南通市下的区县和街道     默认查询
      Logger.log('打印一下list'+list)
      const promise = (await list).map(async (item)=>{
        let pid;  
        if(item.level==2){
             pid = item.href
        }
        if(item.level==3){
            pid =item.id.toString().substring(0,2) + '/'+  item.href
        }
        const itemData = await this.getCityList(pid,item.level+1);
        return {...item,children:itemData}
      }) 
      const result = await Promise.all(promise);
      return result;  
    }catch(err){
        Logger.error('报错了，原因'+err);
    }
}
}
