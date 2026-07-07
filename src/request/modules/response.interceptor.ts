import { router } from "@/router";
import { useUserStore } from "@/stores";
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { createDiscreteApi } from "naive-ui";
import type { ApiResponse } from "../types";
import { SUCCESS_CODE } from "../types";
import { fetchRefreshToken } from "./refresh-token";

const { message } = createDiscreteApi(["message"]);
const UNAUTHORIZED_CODE = 401;

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const isApiResponse = (payload: unknown): payload is ApiResponse => {
  return typeof payload === "object" && payload !== null && "code" in payload && "data" in payload;
};

const isSkipRefreshPath = (url?: string) => {
  if (!url) {
    return false;
  }

  return ["/auth/login", "/auth/refresh", "/auth/logout"].some((path) => url.includes(path));
};

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new Error("刷新 Token 失败"));
      return;
    }

    resolve(token);
  });
  pendingQueue = [];
};

const clearAuthAndRedirect = () => {
  useUserStore().resetSession();

  const currentPath = router.currentRoute.value.fullPath;

  if (router.currentRoute.value.name !== "Login") {
    router.push({
      name: "Login",
      query: currentPath === "/" ? undefined : { redirect: currentPath },
    });
  }
};

const getHttpErrorMessage = (status?: number) => {
  switch (status) {
    case 400:
      return "请求参数错误";
    case 401:
      return "登录已过期，请重新登录";
    case 403:
      return "暂无访问权限";
    case 404:
      return "请求资源不存在";
    case 500:
      return "服务器异常，请稍后重试";
    default:
      return "网络异常，请稍后重试";
  }
};

const retryRequest = (instance: AxiosInstance, config: InternalAxiosRequestConfig, token: string) => {
  config.headers.Authorization = `Bearer ${token}`;
  return instance(config);
};

const handleUnauthorized = async (
  instance: AxiosInstance,
  error: AxiosError<ApiResponse>,
  originalRequest: InternalAxiosRequestConfig,
  fallbackMessage?: string,
) => {
  const businessMessage = fallbackMessage || error.response?.data?.message;
  const userStore = useUserStore();

  if (isSkipRefreshPath(originalRequest.url) || originalRequest._retry) {
    message.error(businessMessage || getHttpErrorMessage(401));
    clearAuthAndRedirect();
    return Promise.reject(error);
  }

  if (!userStore.refreshToken) {
    message.error(businessMessage || getHttpErrorMessage(401));
    clearAuthAndRedirect();
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: (token: string) => {
          resolve(retryRequest(instance, originalRequest, token));
        },
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    const tokens = await fetchRefreshToken(userStore.refreshToken);
    userStore.setTokens(tokens);
    processQueue(null, tokens.accessToken);
    return retryRequest(instance, originalRequest, tokens.accessToken);
  } catch (refreshError) {
    processQueue(refreshError);
    message.error(businessMessage || getHttpErrorMessage(401));
    clearAuthAndRedirect();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

export const setupResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const payload = response.data;

      if (!isApiResponse(payload)) {
        return payload;
      }

      if (payload.code === UNAUTHORIZED_CODE) {
        return handleUnauthorized(
          instance,
          new Error(payload.message || getHttpErrorMessage(401)) as AxiosError<ApiResponse>,
          response.config,
          payload.message,
        );
      }

      if (payload.code !== SUCCESS_CODE) {
        message.error(payload.message || "请求失败");
        return Promise.reject(new Error(payload.message || "请求失败"));
      }

      return payload.data;
    },
    (error: AxiosError<ApiResponse>) => {
      const status = error.response?.status;
      const businessMessage = error.response?.data?.message;
      const originalRequest = error.config;

      if (status === 401 && originalRequest) {
        return handleUnauthorized(instance, error, originalRequest);
      }

      message.error(businessMessage || getHttpErrorMessage(status));
      return Promise.reject(error);
    },
  );
};
