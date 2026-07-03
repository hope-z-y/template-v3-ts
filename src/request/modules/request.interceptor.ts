import { useUserStore } from "@/stores";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const setupRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = useUserStore();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
};
