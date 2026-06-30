import type { AxiosRequestConfig } from "axios";

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 本地 token 存储 key */
export const TOKEN_STORAGE_KEY = "template-v3-ts:token";

/** 业务成功状态码 */
export const SUCCESS_CODE = 0;

export type RequestConfig = AxiosRequestConfig;
