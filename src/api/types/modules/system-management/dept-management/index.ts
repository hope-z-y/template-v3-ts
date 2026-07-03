import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** GET /system/depts 查询参数 */
export interface IQueryDeptParams extends IPagination {
  /** 部门名称（模糊匹配） */
  deptName?: string;
  /** 状态：1启用 0禁用 */
  status?: number;
}

/** POST /system/depts 请求体 */
export interface ICreateDeptParams {
  /** 父部门 ID，根节点为 0 */
  parentId: number;
  /** 部门名称 */
  deptName: string;
  /** 显示顺序 */
  sort?: number;
  /** 负责人 */
  leader?: string;
  /** 联系电话 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 状态：1启用 0禁用 */
  status?: number;
}

/** PATCH /system/depts/:id 请求体 */
export type IUpdateDeptParams = Partial<ICreateDeptParams>;

/** 部门实体 */
export interface IDept extends IAuditable {
  id: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  sort: number;
  leader: string | null;
  phone: string | null;
  email: string | null;
  status: number;
  /** 树形结构子节点 */
  children?: IDept[];
}

/** GET /system/depts 响应体 */
export type IGetDeptListResponse = IPaginationData<IDept>;

/** GET /system/depts/tree 响应体 */
export type IGetDeptTreeResponse = IDept[];
