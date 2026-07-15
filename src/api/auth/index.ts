import { request } from "@/request";
import type {
  ICaptchaResponse,
  IChangeCurrentPasswordParams,
  IProfileUserInfo,
  IRefreshTokenParams,
  IRefreshTokenResponse,
  ISignInParams,
  ISignInResponse,
  ISignOutParams,
  IUpdateCurrentProfileParams,
  IUserProfile,
  IVerifyCurrentPasswordParams,
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
export const SignOut = (data: ISignOutParams) => {
  return request.post<string, null>("/auth/logout", data);
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
 * 一次获取当前用户、权限和动态菜单。
 * 登录成功或恢复会话后只需要调用这个接口，不再单独请求菜单。
 * @returns 当前用户完整的登录上下文
 */
export const GetCurrentUser = () => {
  return request.get<string, IUserProfile>("/auth/profile");
};

/** 更新当前用户可自行维护的个人资料。 */
export const UpdateCurrentProfile = (data: IUpdateCurrentProfileParams) => {
  return request.patch<string, IProfileUserInfo>("/auth/profile", data);
};

/** 校验当前用户密码，供锁屏解锁使用。 */
export const VerifyCurrentPassword = (data: IVerifyCurrentPasswordParams) => {
  return request.post<string, boolean>("/auth/verify-password", data);
};

/** 当前用户修改自己的登录密码。 */
export const ChangeCurrentPassword = (data: IChangeCurrentPasswordParams) => {
  return request.patch<string, string>("/auth/password", data);
};
