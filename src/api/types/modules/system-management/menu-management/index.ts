import type { IPagination } from "../../common";
import type { CommonStatus, EntityId, ISystemAudit, MenuType } from "../common";

export interface IQueryMenuParams extends IPagination {
  menuName?: string;
  menuType?: MenuType;
  permissionCode?: string;
  status?: CommonStatus;
}
export interface ICreateMenuParams {
  parentId?: EntityId | null;
  menuName: string;
  menuType: MenuType;
  routePath?: string;
  component?: string;
  permissionCode?: string;
  icon?: string;
  sort?: number;
  visible?: boolean;
  cacheable?: boolean;
  externalLink?: string;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdateMenuParams = Partial<ICreateMenuParams>;
export interface IMenu extends ISystemAudit {
  parentId: EntityId | null;
  menuName: string;
  menuType: MenuType;
  routePath: string | null;
  component: string | null;
  permissionCode: string | null;
  icon: string | null;
  sort: number;
  visible: boolean;
  cacheable: boolean;
  externalLink: string | null;
  status: CommonStatus;
  children?: IMenu[];
}
export type IGetMenuListResponse = IMenu[];
export type IGetMenuTreeResponse = IMenu[];
