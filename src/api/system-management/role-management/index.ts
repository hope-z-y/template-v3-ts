import { request } from "@/request";
import type { ICreateRoleParams, IGetRoleListResponse, IQueryRoleParams, IRole, IUpdateRoleParams } from "../../types";

/**
 * 分页查询角色列表
 * @param params 查询参数
 * @returns 分页角色列表
 */
export const GetRoleList = (params: IQueryRoleParams) => {
  return request.get<string, IGetRoleListResponse>("/system/roles", { params });
};

/**
 * 根据 ID 查询角色详情
 * @param id 角色 ID
 * @returns 角色详情（含菜单/部门权限）
 */
export const GetRoleById = (id: number) => {
  return request.get<string, IRole>(`/system/roles/${id}`);
};

/**
 * 创建角色
 * @param data 请求体
 * @returns 创建后的角色详情
 */
export const CreateRole = (data: ICreateRoleParams) => {
  return request.post<string, IRole>("/system/roles", data);
};

/**
 * 更新角色
 * @param id 角色 ID
 * @param data 请求体
 * @returns 更新后的角色详情
 */
export const UpdateRole = (id: number, data: IUpdateRoleParams) => {
  return request.patch<string, IRole>(`/system/roles/${id}`, data);
};

/**
 * 删除角色（软删除）
 * @param id 角色 ID
 * @returns 无业务数据
 */
export const DeleteRole = (id: number) => {
  return request.delete<string, null>(`/system/roles/${id}`);
};

export const getRoleList = GetRoleList;
export const getRoleById = GetRoleById;
export const createRole = CreateRole;
export const updateRole = UpdateRole;
export const deleteRole = DeleteRole;
