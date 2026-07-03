import type { IPagination, IPaginationData } from "../../../common";

/** GET /monitor/oper-logs 查询参数 */
export interface IQueryOperLogParams extends IPagination {
  /** 模块标题（模糊匹配） */
  title?: string;
  /** 操作人员（模糊匹配） */
  operName?: string;
  /** 操作状态：0正常 1异常 */
  status?: number;
}

/** 操作日志实体 */
export interface IOperLog {
  id: number;
  title: string | null;
  businessType: number | null;
  method: string | null;
  requestMethod: string | null;
  operatorType: number;
  operName: string | null;
  deptName: string | null;
  operUrl: string | null;
  operIp: string | null;
  operLocation: string | null;
  operParam: string | null;
  jsonResult: string | null;
  status: number;
  errorMsg: string | null;
  operTime: string;
}

/** GET /monitor/oper-logs 响应体 */
export type IGetOperLogListResponse = IPaginationData<IOperLog>;
