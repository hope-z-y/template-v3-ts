import { request } from "@/request";
import type {
  ICreateDictDataParams,
  ICreateDictTypeParams,
  IDictData,
  IDictType,
  IGetDictDataByTypeResponse,
  IGetDictDataListResponse,
  IGetDictTypeListResponse,
  IQueryDictDataParams,
  IUpdateDictDataParams,
  IUpdateDictTypeParams,
} from "../../types";

// --- 字典类型 ---

/**
 * 查询全部字典类型
 * @returns 字典类型列表
 */
export const GetDictTypeList = () => {
  return request.get<string, IGetDictTypeListResponse>("/system/dict/types");
};

/**
 * 根据 ID 查询字典类型
 * @param id 字典类型 ID
 * @returns 字典类型详情
 */
export const GetDictTypeById = (id: number) => {
  return request.get<string, IDictType>(`/system/dict/types/${id}`);
};

/**
 * 创建字典类型
 * @param data 请求体
 * @returns 创建后的字典类型
 */
export const CreateDictType = (data: ICreateDictTypeParams) => {
  return request.post<string, IDictType>("/system/dict/types", data);
};

/**
 * 更新字典类型
 * @param id 字典类型 ID
 * @param data 请求体
 * @returns 更新后的字典类型
 */
export const UpdateDictType = (id: number, data: IUpdateDictTypeParams) => {
  return request.patch<string, IDictType>(`/system/dict/types/${id}`, data);
};

/**
 * 删除字典类型
 * @param id 字典类型 ID
 * @returns 无业务数据
 */
export const DeleteDictType = (id: number) => {
  return request.delete<string, null>(`/system/dict/types/${id}`);
};

// --- 字典数据 ---

/**
 * 分页查询字典数据
 * @param params 查询参数
 * @returns 分页字典数据列表
 */
export const GetDictDataList = (params: IQueryDictDataParams) => {
  return request.get<string, IGetDictDataListResponse>("/system/dict/data", { params });
};

/**
 * 按字典类型查询全部字典项（不分页，常用于下拉框）
 * @param dictType 字典类型标识
 * @returns 字典项列表
 */
export const GetDictDataByType = (dictType: string) => {
  return request.get<string, IGetDictDataByTypeResponse>(`/system/dict/data/type/${dictType}`);
};

/**
 * 根据 ID 查询字典数据
 * @param id 字典数据 ID
 * @returns 字典数据详情
 */
export const GetDictDataById = (id: number) => {
  return request.get<string, IDictData>(`/system/dict/data/${id}`);
};

/**
 * 创建字典数据
 * @param data 请求体
 * @returns 创建后的字典数据
 */
export const CreateDictData = (data: ICreateDictDataParams) => {
  return request.post<string, IDictData>("/system/dict/data", data);
};

/**
 * 更新字典数据
 * @param id 字典数据 ID
 * @param data 请求体
 * @returns 更新后的字典数据
 */
export const UpdateDictData = (id: number, data: IUpdateDictDataParams) => {
  return request.patch<string, IDictData>(`/system/dict/data/${id}`, data);
};

/**
 * 删除字典数据
 * @param id 字典数据 ID
 * @returns 无业务数据
 */
export const DeleteDictData = (id: number) => {
  return request.delete<string, null>(`/system/dict/data/${id}`);
};
