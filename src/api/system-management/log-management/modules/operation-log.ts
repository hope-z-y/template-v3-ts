import { request } from "@/request";
import type { IGetOperLogListResponse, IOperLog, IQueryOperLogParams } from "../../../types";

/**
 * 分页查询操作日志
 * @param params 查询参数
 * @returns 分页操作日志列表
 */
export const GetOperLogList = (params: IQueryOperLogParams) => {
  return request.get<string, IGetOperLogListResponse>("/system/operation-log", { params });
};

/**
 * 根据 ID 查询操作日志详情
 * @param id 操作日志 ID
 * @returns 操作日志详情
 */
export const GetOperLogById = (id: string) => {
  return request.get<string, IOperLog>(`/system/operation-log/${id}`);
};

/**
 * 清空全部操作日志
 * @returns 无业务数据
 */
export const CleanOperLogs = () => {
  return request.delete<string, null>("/system/operation-log/clean");
};

/**
 * 删除单条操作日志
 * @param id 操作日志 ID
 * @returns 无业务数据
 */
export const DeleteOperLog = (id: string) => {
  return request.delete<string, string>(`/system/operation-log/${id}`);
};
