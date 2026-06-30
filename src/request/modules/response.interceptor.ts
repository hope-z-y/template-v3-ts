import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { createDiscreteApi } from "naive-ui";
import { router } from "@/router";
import type { ApiResponse } from "../types";
import { SUCCESS_CODE, TOKEN_STORAGE_KEY } from "../types";

const { message } = createDiscreteApi(["message"]);

const isApiResponse = (payload: unknown): payload is ApiResponse => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "data" in payload
  );
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
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

export const setupResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const payload = response.data;

      if (!isApiResponse(payload)) {
        return payload;
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

      if (status === 401) {
        message.error(businessMessage || getHttpErrorMessage(status));
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      message.error(businessMessage || getHttpErrorMessage(status));
      return Promise.reject(error);
    },
  );
};
