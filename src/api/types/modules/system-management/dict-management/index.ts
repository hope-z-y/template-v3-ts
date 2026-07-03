import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** POST /system/dict/types 请求体 */
export interface ICreateDictTypeParams {
  /** 字典名称 */
  dictName: string;
  /** 字典类型（唯一标识） */
  dictType: string;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** PATCH /system/dict/types/:id 请求体 */
export type IUpdateDictTypeParams = Partial<ICreateDictTypeParams>;

/** 字典类型实体 */
export interface IDictType extends IAuditable {
  id: number;
  dictName: string;
  dictType: string;
  status: number;
  remark: string | null;
}

/** GET /system/dict/types 响应体 */
export type IGetDictTypeListResponse = IDictType[];

/** GET /system/dict/data 查询参数 */
export interface IQueryDictDataParams extends IPagination {
  /** 字典类型 */
  dictType?: string;
  /** 字典标签（模糊匹配） */
  dictLabel?: string;
}

/** POST /system/dict/data 请求体 */
export interface ICreateDictDataParams {
  /** 字典类型 */
  dictType: string;
  /** 字典标签（展示用） */
  dictLabel: string;
  /** 字典键值（存储用） */
  dictValue: string;
  /** 显示顺序 */
  dictSort?: number;
  /** 样式属性（CSS class） */
  cssClass?: string;
  /** 表格回显样式 */
  listClass?: string;
  /** 是否默认：0否 1是 */
  isDefault?: number;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** PATCH /system/dict/data/:id 请求体 */
export type IUpdateDictDataParams = Partial<ICreateDictDataParams>;

/** 字典数据实体 */
export interface IDictData extends IAuditable {
  id: number;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  cssClass: string | null;
  listClass: string | null;
  isDefault: number;
  status: number;
  remark: string | null;
}

/** GET /system/dict/data 响应体 */
export type IGetDictDataListResponse = IPaginationData<IDictData>;

/** GET /system/dict/data/type/:dictType 响应体 */
export type IGetDictDataByTypeResponse = IDictData[];
