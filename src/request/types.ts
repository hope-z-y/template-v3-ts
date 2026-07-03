import type { AxiosRequestConfig } from "axios";

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 业务成功状态码 */
export const SUCCESS_CODE = 200;

export type RequestConfig = AxiosRequestConfig;

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    /** 标记该请求已尝试过 refresh 重试，避免无限循环 */
    _retry?: boolean;
  }
}
