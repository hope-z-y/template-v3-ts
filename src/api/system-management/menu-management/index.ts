import { request } from "@/request";
import type {
  ICreateMenuParams,
  IGetMenuListResponse,
  IGetMenuTreeResponse,
  IMenu,
  IQueryMenuParams,
  IUpdateMenuParams,
} from "../../types";

/**
 * 查询菜单列表（平铺）
 * @returns 菜单列表
 */
export const GetMenuList = (params?: IQueryMenuParams) => {
  return request.get<string, IGetMenuListResponse>("/system/menu", { params });
};

/**
 * 查询菜单树形结构
 * @returns 菜单树
 */
export const GetMenuTree = () => {
  return request.get<string, IGetMenuTreeResponse>("/system/menu/tree");
};

/**
 * 根据 ID 查询菜单详情
 * @param id 菜单 ID
 * @returns 菜单详情
 */
export const GetMenuById = (id: string) => {
  return request.get<string, IMenu>(`/system/menu/${id}`);
};

/**
 * 创建菜单
 * @param data 请求体
 * @returns 创建后的菜单详情
 */
export const CreateMenu = (data: ICreateMenuParams) => {
  return request.post<string, string>("/system/menu", data);
};

/**
 * 更新菜单
 * @param id 菜单 ID
 * @param data 请求体
 * @returns 更新后的菜单详情
 */
export const UpdateMenu = (id: string, data: IUpdateMenuParams) => {
  return request.patch<string, string>(`/system/menu/${id}`, data);
};

/**
 * 删除菜单
 * @param id 菜单 ID
 * @returns 无业务数据
 */
export const DeleteMenu = (id: string) => {
  return request.delete<string, string>(`/system/menu/${id}`);
};
