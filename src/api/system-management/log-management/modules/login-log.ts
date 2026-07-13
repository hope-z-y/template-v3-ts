import { request } from "@/request";
import type { IGetLoginLogListResponse, ILoginLog, IQueryLoginLogParams } from "../../../types";

/**
 * 分页查询登录日志
 * @param params 查询参数
 * @returns 分页登录日志列表
 */
export const GetLoginLogList = (params: IQueryLoginLogParams) => {
  return request.get<string, IGetLoginLogListResponse>("/system/login-log", { params });
};

/**
 * 根据 ID 查询登录日志详情
 * @param id 登录日志 ID
 * @returns 登录日志详情
 */
export const GetLoginLogById = (id: string) => {
  return request.get<string, ILoginLog>(`/system/login-log/${id}`);
};

/**
 * 清空全部登录日志
 * @returns 无业务数据
 */
export const CleanLoginLogs = () => {
  return request.delete<string, null>("/system/login-log/clean");
};

/**
 * 删除单条登录日志
 * @param id 登录日志 ID
 * @returns 无业务数据
 */
export const DeleteLoginLog = (id: string) => {
  return request.delete<string, string>(`/system/login-log/${id}`);
};
