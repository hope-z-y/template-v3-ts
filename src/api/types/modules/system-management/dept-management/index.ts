import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, EntityId, ISystemAudit } from "../common";

export interface IQueryDeptParams extends IPagination {
  deptName?: string;
  deptCode?: string;
  status?: CommonStatus;
}
export interface ICreateDeptParams {
  deptName: string;
  deptCode: string;
  parentId?: EntityId | null;
  leaderUserId?: EntityId;
  phone?: string;
  email?: string;
  sort?: number;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdateDeptParams = Partial<ICreateDeptParams>;
export interface IDept extends ISystemAudit {
  parentId: EntityId | null;
  ancestors: string;
  deptName: string;
  deptCode: string;
  leaderUserId: EntityId | null;
  phone: string | null;
  email: string | null;
  sort: number;
  status: CommonStatus;
  children?: IDept[];
}
export type IGetDeptListResponse = IPaginationData<IDept>;
export type IGetDeptTreeResponse = IDept[];
