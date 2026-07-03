import type { IPagination, IPaginationData } from "../../../common";

/** GET /monitor/login-logs 查询参数 */
export interface IQueryLoginLogParams extends IPagination {
  /** 登录用户名（模糊匹配） */
  username?: string;
  /** 登录状态：0成功 1失败 */
  status?: number;
}

/** 登录日志实体 */
export interface ILoginLog {
  id: number;
  username: string;
  ip: string | null;
  location: string | null;
  browser: string | null;
  os: string | null;
  status: number;
  msg: string | null;
  loginTime: string;
}

/** GET /monitor/login-logs 响应体 */
export type IGetLoginLogListResponse = IPaginationData<ILoginLog>;
