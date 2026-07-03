import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** GET /system/posts 查询参数 */
export interface IQueryPostParams extends IPagination {
  /** 岗位名称（模糊匹配） */
  postName?: string;
  /** 岗位编码（模糊匹配） */
  postCode?: string;
  /** 状态：1启用 0禁用 */
  status?: number;
}

/** POST /system/posts 请求体 */
export interface ICreatePostParams {
  /** 岗位编码 */
  postCode: string;
  /** 岗位名称 */
  postName: string;
  /** 显示顺序 */
  postSort?: number;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** PATCH /system/posts/:id 请求体 */
export type IUpdatePostParams = Partial<ICreatePostParams>;

/** 岗位实体 */
export interface IPost extends IAuditable {
  id: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: number;
  remark: string | null;
}

/** GET /system/posts 响应体 */
export type IGetPostListResponse = IPaginationData<IPost>;
