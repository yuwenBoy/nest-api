import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DeptEntity } from '../../entities/dept.entity';
import { deptToTree } from './dto/elTree';

@Injectable()
export class DeptService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DeptEntity)
    private readonly deptRepository: Repository<DeptEntity>,
  ) {}

   /**
     * 将数值转换成树形展示
     */
    // arrayToTree(arr, pid) {
    //   return arr.reduce((res, current) => {
    //     if (current["parent_id"] == pid) {
    //       // let obj = { department_name: "", label: "",id:"",department_code:'',department_type:'',children:[] };
    //       // obj.id = current["id"];
    //       // obj.department_name = current["department_name"];
    //       // obj.department_code = current["department_code"];
    //       // obj.department_type = current["department_type"] == 1?'机构':'部门';
    //       // obj.children = this.arrayToTree(arr, current["id"]);
    //       // if (arr.filter((t) => t.parent_id == current["id"]).length == 0) {
    //       //   obj.children = undefined;
    //       // }
    //       return res.concat(obj);
    //     }
    //     return res;
    //   }, []);
    // }

  /**
   * 查询机构列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      let list:any = await this.deptRepository.find()
      let result = {
        content:list.reduce(async (res, current) => {
          console.log("==========res======="+res)
            if (current["parent_id"] == parameter.pid) {
              console.log("================="+current)
              let  isChild = await this.deptRepository.createQueryBuilder('dept').where('dept.parent_id = :pid').setParameter('pid',parameter.id).getCount();
              current['children'] = isChild ? []:undefined;
    
              // if (list.filter((t) => t.parent_id == current["id"]).length == 0) {
              //   current['children'] = isChild = undefined;
              // } 
              return res.concat(current);
            }
            return res;
          }, [])
      };
      console.log("==========res======="+parameter.pid)
      return result;
    } catch (error) {
      Logger.error(`机构列表请求失败,原因：${JSON.stringify(error)}`);
      return false;
    }
  }

  // // 判斷是否存在下級部門
  // async getDownDept(id: Number): Promise<any> {
  //   let res = await this.deptServiceRepository
  //     .createQueryBuilder('dept')
  //     .where('dept.parent_id = :parent_id', { parent_id: id })
  //     .getCount();
  //   return res;
  // }

  // /**
  //  * 根据角色ids获取模块ids
  //  * @param roleIds 角色id
  //  * @returns 返回模块id list
  //  */
  // async getDeptAll(pid: Number): Promise<any> {
  //   let parentId = pid ? pid : 0;
  //   const deptList = await this.deptServiceRepository.query(
  //     `select department_name name,department_name label,parent_id pid,id   from t_department where parent_id = ${parentId}`,
  //   );
  //   setTimeout(() => {
  //     deptList.forEach(async (item) => {
  //       item.leaf =
  //         parentId > 0
  //           ? (await this.getDownDept(item.id)) > 0
  //             ? true
  //             : false
  //           : false;
  //       item.hasChildren = !item.leaf;
  //       console.log('=============item============', item);
  //     });
  //   }, 2000);
  //   console.log('=============deptList============', deptList);
  //   return deptList;
  // }


  /**
   * 查询全部机构
   */
  async getDeptTree():Promise<any> {
    try {
      return await this.deptRepository.createQueryBuilder('dept')
      .select(['id','department_name AS label','parent_id','department_type AS type'])
      .where('1=1').getRawMany();
    }
    catch(error){
      Logger.error('查询机构失败，原因：'+error);
    }
  }
}
