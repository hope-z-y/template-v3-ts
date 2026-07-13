import { request } from "@/request";
import type {
  ICreateDeptParams,
  IDept,
  IGetDeptListResponse,
  IGetDeptTreeResponse,
  IQueryDeptParams,
  IUpdateDeptParams,
} from "../../types";

/**
 * 分页查询部门列表
 * @param params 查询参数
 * @returns 分页部门列表
 */
export const GetDeptList = (params: IQueryDeptParams) => {
  return request.get<string, IGetDeptListResponse>("/system/department", { params });
};

/**
 * 查询部门树形结构
 * @returns 部门树
 */
export const GetDeptTree = () => {
  return request.get<string, IGetDeptTreeResponse>("/system/department/tree");
};

/**
 * 根据 ID 查询部门详情
 * @param id 部门 ID
 * @returns 部门详情
 */
export const GetDeptById = (id: string) => {
  return request.get<string, IDept>(`/system/department/${id}`);
};

/**
 * 创建部门
 * @param data 请求体
 * @returns 创建后的部门详情
 */
export const CreateDept = (data: ICreateDeptParams) => {
  return request.post<string, string>("/system/department", data);
};

/**
 * 更新部门
 * @param id 部门 ID
 * @param data 请求体
 * @returns 更新后的部门详情
 */
export const UpdateDept = (id: string, data: IUpdateDeptParams) => {
  return request.patch<string, string>(`/system/department/${id}`, data);
};

/**
 * 删除部门（软删除）
 * @param id 部门 ID
 * @returns 无业务数据
 */
export const DeleteDept = (id: string) => {
  return request.delete<string, string>(`/system/department/${id}`);
};
