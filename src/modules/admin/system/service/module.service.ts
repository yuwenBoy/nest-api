import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ModuleEntity } from 'src/entities/admin/t_module.entity';
import { RoleModuleService } from './roleModule.service';
import { menuDto, menuList, menuMeta } from '../dto/menu.dto';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class ModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    protected readonly roleModuleService: RoleModuleService,
    /**
     * 注入模块事物
     */
    @InjectEntityManager()
    protected readonly moduleManager: EntityManager,
  ) {}

  /**
   * 获取用户操作权限
   * @param moduleIds  菜单id
   * @returns 对象
   */
  async getOptionByMenuId(moduleIds: Number): Promise<any> {
    const result = await this.moduleRepository.query(
      `select permission from t_module where id in (${moduleIds})`,
    );
    return result;
  }

  /**
   * 根据parentid获取子级菜单
   * @returns 获取子级菜单
   */
  async getMenuChild(moduleList: any, pId: Number): Promise<any> {
    const _menuList = [];
    moduleList.forEach((item) => {
      if (item.parent_id == pId) {
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
        _menuList.push(_menuListModal);
      }
    });
    return _menuList;
  }

  /**
   * 根据资源id获取权限菜单
   * @param moduleIds 当前资源所在的模块id
   * @returns 返回菜单
   */
  async getMenuByIds(moduleIds: Number): Promise<any> {
    const moduleEntity = await this.moduleRepository.query(
      `select * from t_module where id in (${moduleIds}) and menu_type !=1 order by index_no desc`,
    );

    const menuList: Array<menuDto> = new Array<menuDto>();

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
          const childTree = this.getMenuChild(moduleEntity, item.id);
          if (childTree) {
            childTree.then((res) => {
              _menuDto.children = res;
            });
          }
          menuList.push(_menuDto);
        }
      }
    });
    return menuList;
  }

  /**
   * 转换成资源树形结构
   * @param arr
   * @param pid 父级id
   * @returns 资源树形结构
   */
  toModuleTree(arr, pid) {
    return arr.reduce((res, current) => {
      if (current['parent_id'] == pid) {
        let obj = { name: '', label: '', id: '', pid: '', children: [] };
        obj.name = current['label'];
        obj.label = current['label'];
        obj.id = current['id'];
        obj.pid = current['parent_id'];
        obj.children = this.toModuleTree(arr, current['id']);
        if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
          obj.children = undefined;
        }
        return res.concat(obj);
      }
      return res;
    }, []);
  }
  /**
   * 查询系统全部资源
   * @returns 返回全部资源【菜单模块表】
   */
  async getModuleList(): Promise<any> {
    return await this.moduleRepository
      .createQueryBuilder('module')
      .select(['id', 'name AS label', 'parent_id'])
      .where('1=1')
      .getRawMany();
  }

  /**
   * 查询全部机构转换成树形结构
   */
  async getModuleTreeAll(): Promise<any> {
    try {
      let list = await this.moduleRepository
        .createQueryBuilder('md')
        .select(['id', 'name AS label', 'parent_id'])
        .where('1=1')
        .getRawMany();
      let result = this.toModuleTree(list, 0);
      return result;
    } catch (error) {
      Logger.error('查询机构失败，原因：' + error);
    }
  }

  /**
   * 根据资源id查询资源
   * @param roleId 资源id
   * @returns
   */
  async findByRoleId(roleId: Number): Promise<any> {
    try {
      let moduleIds = await this.roleModuleService.getRoleModuleById(roleId);
      let ids = moduleIds.map((t) => {
        return t.t_module_id;
      });
      let result = await this.moduleRepository.findByIds(ids);
      return result;
    } catch (error) {
      Logger.error(`查询findByRoleId接口失败，原因：` + error);
    }
  }

  /***
   * 资源列表转换成树形table展示
   */
  toTableTree(arr, pid) {
    return arr.reduce((res, current) => {
      if (current['parent_id'] == pid) {
        current['children'] = this.toTableTree(arr, current['id']);
        if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
          current['children'] = undefined;
        }
        return res.concat(current);
      }
      return res;
    }, []);
  }
  /**
   * 查询资源列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      console.log(
        'service层查询资源列表接受参数：' + JSON.stringify(parameter),
      );
      let queryBuilder = await this.moduleRepository.createQueryBuilder('m');
      if (parameter.name) {
        queryBuilder.where('m.name LIKE "%' + parameter.name + '%"');
      }
      queryBuilder.orderBy(`m.${parameter.sort}`, 'ASC');
      let data = await queryBuilder.getMany();
      let result = {
        content: parameter.name ? data : this.toTableTree(data, 0),
      };
      return result;
    } catch (error) {
      Logger.error(`资源列表请求失败,原因：${JSON.stringify(error)}`);
    }
  }

  /**
   * 新增|编辑 资源
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any, userName: string): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        parameter.create_by = userName;
      } else {
        parameter.update_by = userName;
      }
      // 必须用save 更新时间才生效
      let res = await this.moduleRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】资源请求失败：${JSON.stringify(error)}`);
    }
  }

  async getChidIds(id: any): Promise<any> {
    let list = await this.moduleRepository.query(
      'select * from t_module where parent_id = ' + id + '',
    );
    return list;
  }

  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    try {
      const roleIds = await this.roleModuleService.getRoleIdByModuleIds(ids);
      if (roleIds.length > 0) {
        return '删除失败，该模块下已有授权的资源，不能删除。';
      }
      let a = await this.moduleRepository.delete(ids);
      if (a.affected == 0) return '删除失败';
      return true;
    } catch (error) {
      Logger.error('模块服务层批量删除方法异常，原因：' + error);
      return '删除失败';
    }
  }
}