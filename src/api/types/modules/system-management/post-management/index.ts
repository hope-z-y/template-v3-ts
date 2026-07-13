import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, ISystemAudit } from "../common";

export interface IQueryPostParams extends IPagination {
  postCode?: string;
  postName?: string;
  status?: CommonStatus;
}
export interface ICreatePostParams {
  postCode: string;
  postName: string;
  postSort?: number;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdatePostParams = Partial<ICreatePostParams>;
export interface IPost extends ISystemAudit {
  postCode: string;
  postName: string;
  postSort: number;
  status: CommonStatus;
}
export type IGetPostListResponse = IPaginationData<IPost>;
