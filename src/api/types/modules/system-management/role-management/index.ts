import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, DataScope, EntityId, ISystemAudit } from "../common";

export interface IQueryRoleParams extends IPagination {
  roleName?: string;
  roleKey?: string;
  status?: CommonStatus;
}
export interface ICreateRoleParams {
  roleName: string;
  roleKey: string;
  roleSort?: number;
  dataScope?: DataScope;
  status?: CommonStatus;
  menuIds?: EntityId[];
  deptIds?: EntityId[];
  remark?: string;
}
export type IUpdateRoleParams = Partial<ICreateRoleParams>;
export interface IRole extends ISystemAudit {
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: DataScope;
  status: CommonStatus;
  menuIds: EntityId[];
  deptIds: EntityId[];
}
export type IGetRoleListResponse = IPaginationData<IRole>;
