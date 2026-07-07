import type { IMenu } from "./system-management/menu-management";
import type { IUser } from "./system-management/user-management";

/** POST /auth/login 请求体 */
export interface ISignInParams {
  /** 登录账号，2-50 字符 */
  account: string;
  /** RSA 公钥加密后的 Base64 密文 */
  password: string;
  /** 验证码（开启验证码时必填） */
  captchaCode?: string;
  /** 验证码 key（开启验证码时必填） */
  captchaKey?: string;
}

/** 登录 / 刷新 Token 成功后返回的令牌对 */
export interface IAuthTokenResponse {
  /** 访问 token */
  accessToken: string;
  /** 刷新 token */
  refreshToken: string;
  /** accessToken 剩余有效秒数 */
  expiresIn: number;
}

/** POST /auth/login 响应体 */
export type ISignInResponse = IAuthTokenResponse;

/** POST /auth/refresh 请求体 */
export interface IRefreshTokenParams {
  /** refresh token */
  refreshToken: string;
}

/** POST /auth/refresh 响应体 */
export type IRefreshTokenResponse = IAuthTokenResponse;

/** GET /auth/public-key 响应体 */
export interface IPublicEncryptKeyResponse {
  /** RSA 公钥 PEM，供前端加密密码 */
  publicKey: string;
}

/** GET /auth/menus 响应体（当前用户角色可见的菜单树） */
export type IGetUserMenusResponse = IMenu[];

/** GET /auth/profile 响应体 */
export interface IUserProfile {
  /** 当前登录用户 */
  user: IUser;
  /** 角色编码列表 */
  roles: string[];
  /** 权限标识列表 */
  permissions: string[];
}

/** GET /auth/captcha 响应体 */
export interface ICaptchaResponse {
  /** 验证码功能是否开启 */
  enabled: boolean;
  /** 验证码 key，登录时需回传 */
  captchaKey?: string;
  /** 验证码图片，推荐 data:image/*、图片路径或后端净化后的 SVG 字符串 */
  img?: string;
}
