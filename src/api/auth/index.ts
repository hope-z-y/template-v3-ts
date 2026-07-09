import { request } from "@/request";
import type {
  ICaptchaResponse,
  IGetUserMenusResponse,
  IRefreshTokenParams,
  IRefreshTokenResponse,
  ISignInParams,
  ISignInResponse,
  IUserProfile,
} from "../types";

/**
 * 使用账号、密码登录
 * @param data 请求体
 * @returns 登录成功后的令牌数据
 */
export const SignIn = (data: ISignInParams) => {
  return request.post<string, ISignInResponse>("/auth/login", data);
};

/**
 * 退出登录（需携带 accessToken）
 * @returns 无业务数据
 */
export const SignOut = () => {
  return request.post<string, null>("/auth/logout");
};

/**
 * 获取图形验证码
 * @returns 验证码开关状态；开启时附带 captchaKey 与验证码图片
 */
export const GetCaptchaCode = () => {
  return request.get<string, ICaptchaResponse>("/captchaImage");
};

/**
 * 获取 RSA 公钥（登录前加密密码用）
 * @returns PEM 格式公钥
 */
export const GetPublicEncryptKey = () => {
  return request.get<string, string>("/auth/public-key");
};

/**
 * 刷新 Token
 * @param data 含 refreshToken 的请求体
 * @returns 新的令牌对（refreshToken 会轮换，需覆盖本地存储）
 */
export const RefreshToken = (data: IRefreshTokenParams) => {
  return request.post<string, IRefreshTokenResponse>("/auth/refresh", data);
};

/**
 * 获取当前登录用户可见的菜单树（按角色过滤）
 * @returns 菜单树，用于动态路由与侧边栏
 */
export const GetUserMenus = () => {
  return request.get<string, IGetUserMenusResponse>("/auth/menus");
};

/**
 * 获取当前登录用户信息、角色与权限标识
 * @returns 当前用户权限上下文
 */
export const GetCurrentUser = () => {
  return request.get<string, IUserProfile>("/auth/profile");
};
