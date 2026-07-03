import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** GET /system/configs 查询参数 */
export interface IQueryConfigParams extends IPagination {
  /** 参数名称（模糊匹配） */
  configName?: string;
  /** 参数键名（模糊匹配） */
  configKey?: string;
}

/** POST /system/configs 请求体 */
export interface ICreateConfigParams {
  /** 参数名称 */
  configName: string;
  /** 参数键名（唯一） */
  configKey: string;
  /** 参数键值 */
  configValue: string;
  /** 系统内置：0否 1是 */
  configType?: number;
  /** 备注 */
  remark?: string;
}

/** PATCH /system/configs/:id 请求体 */
export type IUpdateConfigParams = Partial<ICreateConfigParams>;

/** 参数配置实体 */
export interface IConfig extends IAuditable {
  id: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: number;
  remark: string | null;
}

/** GET /system/configs 响应体 */
export type IGetConfigListResponse = IPaginationData<IConfig>;
