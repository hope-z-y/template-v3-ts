import { request } from "@/request";
import type { ICreatePostParams, IGetPostListResponse, IPost, IQueryPostParams, IUpdatePostParams } from "../../types";

/**
 * 分页查询岗位列表
 * @param params 查询参数
 * @returns 分页岗位列表
 */
export const GetPostList = (params: IQueryPostParams) => {
  return request.get<string, IGetPostListResponse>("/system/post", { params });
};

/**
 * 根据 ID 查询岗位详情
 * @param id 岗位 ID
 * @returns 岗位详情
 */
export const GetPostById = (id: string) => {
  return request.get<string, IPost>(`/system/post/${id}`);
};

/**
 * 创建岗位
 * @param data 请求体
 * @returns 创建后的岗位详情
 */
export const CreatePost = (data: ICreatePostParams) => {
  return request.post<string, string>("/system/post", data);
};

/**
 * 更新岗位
 * @param id 岗位 ID
 * @param data 请求体
 * @returns 更新后的岗位详情
 */
export const UpdatePost = (id: string, data: IUpdatePostParams) => {
  return request.patch<string, string>(`/system/post/${id}`, data);
};

/**
 * 删除岗位（软删除）
 * @param id 岗位 ID
 * @returns 无业务数据
 */
export const DeletePost = (id: string) => {
  return request.delete<string, string>(`/system/post/${id}`);
};
