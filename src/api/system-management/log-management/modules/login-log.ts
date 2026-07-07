import { request } from "@/request";
import type { IGetLoginLogListResponse, ILoginLog, IQueryLoginLogParams } from "../../../types";

/**
 * 分页查询登录日志
 * @param params 查询参数
 * @returns 分页登录日志列表
 */
export const GetLoginLogList = (params: IQueryLoginLogParams) => {
  return request.get<string, IGetLoginLogListResponse>("/monitor/login-logs", { params });
};

/**
 * 根据 ID 查询登录日志详情
 * @param id 登录日志 ID
 * @returns 登录日志详情
 */
export const GetLoginLogById = (id: number) => {
  return request.get<string, ILoginLog>(`/monitor/login-logs/${id}`);
};

/**
 * 清空全部登录日志
 * @returns 无业务数据
 */
export const CleanLoginLogs = () => {
  return request.delete<string, null>("/monitor/login-logs/clean");
};

/**
 * 删除单条登录日志
 * @param id 登录日志 ID
 * @returns 无业务数据
 */
export const DeleteLoginLog = (id: number) => {
  return request.delete<string, null>(`/monitor/login-logs/${id}`);
};

export const getLoginLogList = GetLoginLogList;
export const getLoginLogById = GetLoginLogById;
export const cleanLoginLogs = CleanLoginLogs;
export const deleteLoginLog = DeleteLoginLog;
