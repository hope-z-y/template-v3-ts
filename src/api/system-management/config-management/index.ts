import { request } from "@/request";
import type {
  IConfig,
  ICreateConfigParams,
  IGetConfigListResponse,
  IQueryConfigParams,
  IUpdateConfigParams,
} from "../../types";

/**
 * 分页查询参数配置列表
 * @param params 查询参数
 * @returns 分页参数配置列表
 */
export const GetConfigList = (params: IQueryConfigParams) => {
  return request.get<string, IGetConfigListResponse>("/system/parameter", { params });
};

/**
 * 按 paramKey 查询参数值
 * @param paramKey 参数键名
 * @returns 参数配置详情
 */
export const GetConfigByKey = (paramKey: string) => {
  return request.get<string, IConfig>(`/system/parameter/key/${encodeURIComponent(paramKey)}`);
};

/**
 * 根据 ID 查询参数配置
 * @param id 参数配置 ID
 * @returns 参数配置详情
 */
export const GetConfigById = (id: string) => {
  return request.get<string, IConfig>(`/system/parameter/${id}`);
};

/**
 * 创建参数配置
 * @param data 请求体
 * @returns 创建后的参数配置
 */
export const CreateConfig = (data: ICreateConfigParams) => {
  return request.post<string, string>("/system/parameter", data);
};

/**
 * 更新参数配置
 * @param id 参数配置 ID
 * @param data 请求体
 * @returns 更新后的参数配置
 */
export const UpdateConfig = (id: string, data: IUpdateConfigParams) => {
  return request.patch<string, string>(`/system/parameter/${id}`, data);
};

/**
 * 删除参数配置
 * @param id 参数配置 ID
 * @returns 无业务数据
 */
export const DeleteConfig = (id: string) => {
  return request.delete<string, string>(`/system/parameter/${id}`);
};
