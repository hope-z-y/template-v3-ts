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
  return request.get<string, IGetDeptListResponse>("/system/depts", { params });
};

/**
 * 查询部门树形结构
 * @returns 部门树
 */
export const GetDeptTree = () => {
  return request.get<string, IGetDeptTreeResponse>("/system/depts/tree");
};

/**
 * 根据 ID 查询部门详情
 * @param id 部门 ID
 * @returns 部门详情
 */
export const GetDeptById = (id: number) => {
  return request.get<string, IDept>(`/system/depts/${id}`);
};

/**
 * 创建部门
 * @param data 请求体
 * @returns 创建后的部门详情
 */
export const CreateDept = (data: ICreateDeptParams) => {
  return request.post<string, IDept>("/system/depts", data);
};

/**
 * 更新部门
 * @param id 部门 ID
 * @param data 请求体
 * @returns 更新后的部门详情
 */
export const UpdateDept = (id: number, data: IUpdateDeptParams) => {
  return request.patch<string, IDept>(`/system/depts/${id}`, data);
};

/**
 * 删除部门（软删除）
 * @param id 部门 ID
 * @returns 无业务数据
 */
export const DeleteDept = (id: number) => {
  return request.delete<string, null>(`/system/depts/${id}`);
};

export const getDeptList = GetDeptList;
export const getDeptTree = GetDeptTree;
export const getDeptById = GetDeptById;
export const createDept = CreateDept;
export const updateDept = UpdateDept;
export const deleteDept = DeleteDept;
