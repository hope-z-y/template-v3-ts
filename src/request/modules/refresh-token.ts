import type { IAuthTokenResponse, IRefreshTokenParams } from "@/api/types";
import axios from "axios";
import type { ApiResponse } from "../types";
import { SUCCESS_CODE } from "../types";

const baseURL = import.meta.env.VITE_API_PREFIX;

/**
 * 使用独立 axios 实例刷新 Token，避免与主 request 拦截器形成循环依赖。
 */
export const fetchRefreshToken = async (refreshToken: string): Promise<IAuthTokenResponse> => {
  const { data: payload } = await axios.post<ApiResponse<IAuthTokenResponse>>(
    `${baseURL || ""}/auth/refresh`,
    { refreshToken } satisfies IRefreshTokenParams,
    {
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15_000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (payload.code !== SUCCESS_CODE) {
    throw new Error(payload.message || "刷新 Token 失败");
  }

  return payload.data;
};
