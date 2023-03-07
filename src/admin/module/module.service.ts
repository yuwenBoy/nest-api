import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/t_user_role.entity';
import { Repository } from 'typeorm';
import { ModuleNEST } from '../../entities/t_module.entity';
import { UserRoleService } from '../userRole/userRole.service';
import { menuDto, menuList, menuMeta } from './dto/menu.dto';

@Injectable()
export class ModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(ModuleNEST)
    private readonly moduleRepository: Repository<ModuleNEST>,
  ) {}

  getHello(id: string): string {
    // 这里可以进行数据哭的相关操作，最后将需要返回的数据return出去
    return `hello GET 参数id:${id}`;
  }
  //   postHello(data: PostDataDto) {
  //     return `hello POST 参数code:${data.code};name:${data.name}`;
  //   }
  updateHello(id: string, message: string): string {
    return `hello Patch 参数id:${id};message:${message}`;
  }
  removeHello(id: number): string {
    return `hello delete 参数id:${id}`;
  }

  async findAll(): Promise<ModuleNEST[]> {
    return await this.moduleRepository.query('select * from t_module');
  }

    //   /*
    // * 根据id查询子项数据
    // * */
    //   public List<ModuleListDto> moduleToTreeChild(List<Module> moduleList, Long id) {
    //     List<ModuleListDto> trees = new ArrayList<>();
    //     for (Module d : moduleList) {
    //         if (d.getParentId() == id) {
    //             ModuleListDto tree = new ModuleListDto();
    //             ModuleMeta meta = new ModuleMeta();
    //             tree.setComponent(d.getMenuPath());
    //             tree.setName(d.getName());
    //             tree.setPath(d.getMenuPath());
    //             tree.setHidden(false);
    //             meta.setTitle(d.getName());
    //             meta.setNoCache(true);
    //             meta.setIcon(d.getIcon());
    //             tree.setMeta(meta);
    //             trees.add(tree);
    //         }
    //     }
    //     return trees;
    // }
   
   /**
    * 根据parentid获取子级菜单
    * @returns 获取子级菜单
    */
   async getMenuChild(moduleList:any,pId:Number):Promise<any> {
      const _menuList = [];
      moduleList.forEach(item=>{
        if(item._parent_id == pId){
             const _menuListModal = new menuList();
             const _meta = new menuMeta();
             _menuListModal.component = item._menuPath;
             _menuListModal.name = item._name;
             _menuListModal.path = item._menuPath;
             _menuListModal.hidden = false;
             _meta.title = item._name;
             _meta.noCache = true;
             _meta.icon = item._icon;
             _menuListModal.meta = _meta;
             _menuList.push(_menuListModal)
        }
      })
    console.log('调用二级菜单_menuList====================',_menuList);

      return _menuList;
    }

  /**
   * 根据角色id获取权限菜单
   * @param moduleIds 当前角色所在的模块id
   * @returns 返回菜单
   */
  async getMenuByIds(moduleIds: Number): Promise<any> {
    const moduleEntity = await this.moduleRepository
      .createQueryBuilder(" ")
      .where('id IN (' + moduleIds + ') AND menu_type !=1')
      .orderBy('index_no', 'DESC')
      .setParameter('id', moduleIds)
      .getRawMany();
    
   const menuList:Array<menuDto> = new Array<menuDto>();   

    moduleEntity.forEach((item) => {
      const _menuDto = new menuDto();
      const _meta = new menuMeta();
      if (item) {
        if (item._parent_id == 0) {
          _menuDto.name = item._name;
          _menuDto.hidden = false;
          _menuDto.component = 'Layout';
          _menuDto.path = '/' + item._menu_path;
          _menuDto.redirect = 'noredirect';
          _menuDto.alwaysShow = true;
          _meta.icon = item._icon;
          _meta.noCache = true;
          _meta.title = item._name;
          _menuDto.meta = _meta;
          console.log('查看数据======begin======',JSON.stringify(moduleEntity))
          const childTree = this.getMenuChild(moduleEntity,item._id);
          console.log('查看数据=========end===')
          if(childTree) {
             childTree.then(res=>{
              _menuDto.children =res;
            });
          }
          menuList.push(_menuDto);
        }
      }
    });

    console.log('权限菜单====================' + JSON.stringify(moduleEntity));
    console.log('权限菜单====转换后===============' + JSON.stringify(menuList));
    return menuList;
  }
}
