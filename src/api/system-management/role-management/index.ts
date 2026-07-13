import { request } from "@/request";
import type { ICreateRoleParams, IGetRoleListResponse, IQueryRoleParams, IRole, IUpdateRoleParams } from "../../types";

/**
 * 分页查询角色列表
 * @param params 查询参数
 * @returns 分页角色列表
 */
export const GetRoleList = (params: IQueryRoleParams) => {
  return request.get<string, IGetRoleListResponse>("/system/role", { params });
};

/**
 * 根据 ID 查询角色详情
 * @param id 角色 ID
 * @returns 角色详情（含菜单/部门权限）
 */
export const GetRoleById = (id: string) => {
  return request.get<string, IRole>(`/system/role/${id}`);
};

/**
 * 创建角色
 * @param data 请求体
 * @returns 创建后的角色详情
 */
export const CreateRole = (data: ICreateRoleParams) => {
  return request.post<string, string>("/system/role", data);
};

/**
 * 更新角色
 * @param id 角色 ID
 * @param data 请求体
 * @returns 更新后的角色详情
 */
export const UpdateRole = (id: string, data: IUpdateRoleParams) => {
  return request.patch<string, string>(`/system/role/${id}`, data);
};

/**
 * 删除角色（软删除）
 * @param id 角色 ID
 * @returns 无业务数据
 */
export const DeleteRole = (id: string) => {
  return request.delete<string, string>(`/system/role/${id}`);
};
