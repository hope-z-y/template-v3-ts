/** POST /system/menus 请求体 */
export interface ICreateMenuParams {
  /** 父菜单 ID，根节点为 0 */
  parentId: number;
  /** 菜单类型：M=目录 C=菜单 F=按钮 */
  menuType: "M" | "C" | "F";
  /** 菜单名称 */
  menuName: string;
  /** 权限标识 */
  permission?: string;
  /** 路由地址 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 路由参数 */
  query?: string;
  /** 菜单图标 */
  icon?: string;
  /** 显示顺序 */
  sort?: number;
  /** 是否显示：1显示 0隐藏 */
  visible?: number;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 是否外链：1是 0否 */
  isFrame?: number;
  /** 是否缓存：1缓存 0不缓存 */
  isCache?: number;
}

/** PATCH /system/menus/:id 请求体 */
export type IUpdateMenuParams = Partial<ICreateMenuParams>;

/** 菜单实体 */
export interface IMenu {
  id: number;
  parentId: number;
  menuType: string;
  menuName: string;
  permission: string | null;
  path: string | null;
  component: string | null;
  query: string | null;
  icon: string | null;
  sort: number;
  visible: number;
  status: number;
  isFrame: number;
  isCache: number;
  createdAt: string;
  updatedAt: string;
  /** 树形结构子节点 */
  children?: IMenu[];
}

/** GET /system/menus 响应体 */
export type IGetMenuListResponse = IMenu[];

/** GET /system/menus/tree 响应体 */
export type IGetMenuTreeResponse = IMenu[];
