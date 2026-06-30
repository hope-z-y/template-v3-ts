import { request } from "@/request";
import type { IUserInfo } from "./type";

export const GetUserInfo = (userId: string) => {
  return request.get<string, IUserInfo>("/api/user/info", {
    params: { userId },
  });
};
