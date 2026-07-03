import { request } from "@/request";
import type {
  ICreateMenuParams,
  IGetMenuListResponse,
  IGetMenuTreeResponse,
  IMenu,
  IUpdateMenuParams,
} from "../../types";

/**
 * 查询菜单列表（平铺）
 * @returns 菜单列表
 */
export const GetMenuList = () => {
  return request.get<string, IGetMenuListResponse>("/system/menus");
};

/**
 * 查询菜单树形结构
 * @returns 菜单树
 */
export const GetMenuTree = () => {
  return request.get<string, IGetMenuTreeResponse>("/system/menus/tree");
};

/**
 * 根据 ID 查询菜单详情
 * @param id 菜单 ID
 * @returns 菜单详情
 */
export const GetMenuById = (id: number) => {
  return request.get<string, IMenu>(`/system/menus/${id}`);
};

/**
 * 创建菜单
 * @param data 请求体
 * @returns 创建后的菜单详情
 */
export const CreateMenu = (data: ICreateMenuParams) => {
  return request.post<string, IMenu>("/system/menus", data);
};

/**
 * 更新菜单
 * @param id 菜单 ID
 * @param data 请求体
 * @returns 更新后的菜单详情
 */
export const UpdateMenu = (id: number, data: IUpdateMenuParams) => {
  return request.patch<string, IMenu>(`/system/menus/${id}`, data);
};

/**
 * 删除菜单
 * @param id 菜单 ID
 * @returns 无业务数据
 */
export const DeleteMenu = (id: number) => {
  return request.delete<string, null>(`/system/menus/${id}`);
};
