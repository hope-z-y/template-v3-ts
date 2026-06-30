import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { TOKEN_STORAGE_KEY } from "../types";

export const setupRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
};
