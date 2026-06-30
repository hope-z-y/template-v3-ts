import axios from "axios";
import { setupRequestInterceptor } from "./modules/request.interceptor";
import { setupResponseInterceptor } from "./modules/response.interceptor";

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_PROXY_PREFIX
  : import.meta.env.VITE_API_PREFIX;

export const request = axios.create({
  baseURL: baseURL || "/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

setupRequestInterceptor(request);
setupResponseInterceptor(request);

export * from "./types";
