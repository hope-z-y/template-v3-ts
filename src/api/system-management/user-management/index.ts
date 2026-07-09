import { request } from "@/request";
import type {
  ICreateUserParams,
  IGetAllUsersResponse,
  IUserDetail,
  IUserList,
  IQueryUserParams,
  IUpdateUserParams,
  IUser,
} from "../../types";

/**
 * 分页查询用户列表
 * @param params 查询参数
 * @returns 分页用户列表
 */
export const GetUserList = (params: IQueryUserParams) => {
  return request.get<string, IUserList>("/system/users", { params });
};

/**
 * 查询全部用户（下拉选项，不分页）
 * @returns 全部用户列表
 */
export const GetAllUsers = () => {
  return request.get<string, IGetAllUsersResponse>("/system/users/all");
};

/**
 * 根据 ID 查询用户详情
 * @param id 用户 ID
 * @returns 用户详情（含角色、岗位关联）
 */
export const GetUserById = (id: number) => {
  return request.get<string, IUserDetail>(`/system/users/${id}`);
};

/**
 * 创建用户
 * @param data 请求体
 * @returns 创建后的用户详情
 */
export const CreateUser = (data: ICreateUserParams) => {
  return request.post<string, IUser>("/system/users", data);
};

/**
 * 更新用户
 * @param id 用户 ID
 * @param data 请求体
 * @returns 更新后的用户详情
 */
export const UpdateUser = (id: number, data: IUpdateUserParams) => {
  return request.patch<string, IUser>(`/system/users/${id}`, data);
};

/**
 * 删除用户
 * @param id 用户 ID
 * @returns 无业务数据
 */
export const DeleteUser = (id: number) => {
  return request.delete<string, null>(`/system/users/${id}`);
};

/**
 * 重置用户密码
 * @param id 用户 ID
 * @param data RSA 加密后的新密码
 * @returns 更新后的用户详情
 */
export const ResetUserPassword = (id: number, data: Pick<IUpdateUserParams, "password">) => {
  return request.patch<string, IUserDetail>(`/system/users/${id}`, data);
};
