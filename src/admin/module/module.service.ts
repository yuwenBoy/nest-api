import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleNEST } from '../../entities/t_module.entity';
import { RoleModuleService } from '../roleModule/roleModule.service';
import { menuDto, menuList, menuMeta } from './dto/menu.dto';

@Injectable()
export class ModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(ModuleNEST)
    private readonly moduleRepository: Repository<ModuleNEST>,
    protected readonly roleModuleService:RoleModuleService,
  ) {}
 
  /**
   * 获取用户操作权限
   * @param moduleIds  菜单id
   * @returns 对象
   */
  async getOptionByMenuId(moduleIds:Number):Promise<any>{
    const result = await this.moduleRepository.query(`select permission from t_module where id in (${moduleIds})`);
    return result;
  }
   
   /**
    * 根据parentid获取子级菜单
    * @returns 获取子级菜单
    */
   async getMenuChild(moduleList:any,pId:Number):Promise<any> {
      const _menuList = [];
      moduleList.forEach(item=>{
        if(item.parent_id == pId){
             const _menuListModal = new menuList();
             const _meta = new menuMeta();
             _menuListModal.component = item.menu_path;
             _menuListModal.name = item.menu_path.split('/')[0];
             _menuListModal.path = item.menu_path;
             _menuListModal.hidden = false;
             _meta.title = item.name;
             _meta.noCache = true;
             _meta.icon = item.icon;
             _menuListModal.meta = _meta;
             _menuList.push(_menuListModal)
        }
      })
      return _menuList;
    }

  /**
   * 根据角色id获取权限菜单
   * @param moduleIds 当前角色所在的模块id
   * @returns 返回菜单
   */
  async getMenuByIds(moduleIds: Number): Promise<any> {

    const moduleEntity = await this.moduleRepository.query(`select * from t_module where id in (${moduleIds}) and menu_type !=1 order by index_no desc`);
    // const moduleEntity = await this.moduleRepository
    //   .createQueryBuilder(" ")
    //   .where('id IN (' + moduleIds + ') AND menu_type !=1')
    //   .orderBy('index_no', 'DESC')
    //   .setParameter('id', moduleIds)
    //   .getRawMany();
    
   const menuList:Array<menuDto> = new Array<menuDto>();   

    moduleEntity.forEach((item) => {
      const _menuDto = new menuDto();
      const _meta = new menuMeta();
      if (item) {
        if (item.parent_id == 0) {
          _menuDto.name = item.name;
          _menuDto.hidden = false;
          _menuDto.component = 'Layout';
          _menuDto.path = '/' + item.menu_path;
          _menuDto.redirect = 'noredirect';
          _menuDto.alwaysShow = true;
          _meta.icon = item.icon;
          _meta.noCache = true;
          _meta.title = item.name;
          _menuDto.meta = _meta;
          const childTree = this.getMenuChild(moduleEntity,item.id);
          if(childTree) {
             childTree.then(res=>{
              _menuDto.children =res;
            });
          }
          menuList.push(_menuDto);
        }
      }
    });
    return menuList;
  }

  /**
   * 查询系统全部资源
   * @returns 返回全部资源【菜单模块表】
   */
  async getModuleTreeAll():Promise<any>{
    return await this.moduleRepository.createQueryBuilder('module')
    .select(['id','name AS label','parent_id'])
    .where('1=1').getRawMany();
  }

  /**
   * 根据角色id查询资源
   * @param roleId 角色id
   * @returns 
   */
  async findByRoleId(roleId:Number):Promise<any> {
    try {
      // let sql = `select t_module_id t_role_module where t_role_id = ${roleId}`;
      // let moduleIds= await this.moduleRepository.query(sql);
      let moduleIds =  await this.roleModuleService.getRoleModuleById(roleId);
      console.log('moduleIds============='+moduleIds.map(t=>{return t.t_module_id}).toString())
      let ids = moduleIds.map(t=>{return t.t_module_id})
       let result = await this.moduleRepository.findByIds(ids)
       console.log('result======='+result);
       return result;
    } catch (error) {
        Logger.error(`查询findByRoleId接口失败，原因：`+error);
    }
    
  }
}
