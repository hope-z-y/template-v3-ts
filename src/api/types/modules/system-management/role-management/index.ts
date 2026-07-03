import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** GET /system/roles 查询参数 */
export interface IQueryRoleParams extends IPagination {
  /** 角色名称（模糊匹配） */
  roleName?: string;
  /** 角色编码（模糊匹配） */
  roleCode?: string;
  /** 状态：1启用 0禁用 */
  status?: number;
}

/** POST /system/roles 请求体 */
export interface ICreateRoleParams {
  /** 角色编码 */
  roleCode: string;
  /** 角色名称 */
  roleName: string;
  /** 显示顺序 */
  roleSort?: number;
  /** 数据权限：1全部 2自定义 3本部门 4本部门及以下 5仅本人 */
  dataScope?: number;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
  /** 菜单权限 ID 列表 */
  menuIds?: number[];
  /** 自定义数据权限时的部门 ID 列表 */
  deptIds?: number[];
}

/** PATCH /system/roles/:id 请求体 */
export type IUpdateRoleParams = Partial<ICreateRoleParams>;

/** 角色实体 */
export interface IRole extends IAuditable {
  id: number;
  roleCode: string;
  roleName: string;
  roleSort: number;
  dataScope: number;
  status: number;
  remark: string | null;
  roleMenus?: Array<{
    roleId: number;
    menuId: number;
    menu?: {
      id: number;
      menuName: string;
      permission: string | null;
    };
  }>;
  roleDepts?: Array<{
    roleId: number;
    deptId: number;
    dept?: {
      id: number;
      deptName: string;
    };
  }>;
}

/** GET /system/roles 响应体 */
export type IGetRoleListResponse = IPaginationData<IRole>;
