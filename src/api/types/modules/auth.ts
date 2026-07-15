/** POST /auth/login 请求体 */
export interface ISignInParams {
  /** 登录账号，2-50 字符 */
  account: string;
  /** RSA 公钥加密后的 Base64 密文 */
  password: string;
  /** 验证码（开启验证码时必填） */
  captchaCode: string;
  /** 验证码 key（开启验证码时必填） */
  captchaKey: string;
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

/** POST /auth/logout 请求体。 */
export type ISignOutParams = IRefreshTokenParams;

/** POST /auth/refresh 响应体 */
export type IRefreshTokenResponse = IAuthTokenResponse;

export interface IUpdateCurrentProfileParams {
  username?: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
  gender?: "unknown" | "male" | "female";
}

export interface IVerifyCurrentPasswordParams {
  password: string;
}

export interface IChangeCurrentPasswordParams {
  currentPassword: string;
  newPassword: string;
}

/** 后端雪花 ID 始终按字符串接收，避免转成 JavaScript number 后丢失精度。 */
export type AuthEntityId = string;

/** 后端通用启用状态。 */
export type AuthEntityStatus = "enabled" | "disabled";

/** 后端所有详情 DTO 都包含的审计字段。 */
export interface IProfileAuditFields {
  /** 实体主键。 */
  id: AuthEntityId;
  /** 创建时间，HTTP 响应中的日期会被序列化为字符串。 */
  createdAt: string;
  /** 最后更新时间。 */
  updatedAt: string;
  /** 创建人 ID，系统自动创建时可能为空。 */
  createdById: AuthEntityId | null;
  /** 最后修改人 ID。 */
  updatedById: AuthEntityId | null;
  /** 备注。 */
  remark: string | null;
}

/** Profile 中返回的角色信息。 */
export interface IProfileRole extends IProfileAuditFields {
  /** 角色名称，例如“超级管理员”。 */
  roleName: string;
  /** 角色唯一标识，例如 admin；前端使用它判断角色。 */
  roleKey: string;
  /** 角色显示顺序。 */
  roleSort: number;
  /** 数据权限范围。 */
  dataScope: "all" | "custom" | "department" | "department_and_children" | "self";
  /** 角色是否启用。 */
  status: AuthEntityStatus;
  /** 角色拥有的菜单 ID。 */
  menuIds: AuthEntityId[];
  /** 自定义数据权限包含的部门 ID。 */
  deptIds: AuthEntityId[];
}

/** Profile 中返回的岗位信息。 */
export interface IProfilePost extends IProfileAuditFields {
  /** 岗位编码。 */
  postCode: string;
  /** 岗位名称。 */
  postName: string;
  /** 岗位显示顺序。 */
  postSort: number;
  /** 岗位是否启用。 */
  status: AuthEntityStatus;
}

/** Profile 中返回的部门摘要。 */
export interface IProfileDepartment extends IProfileAuditFields {
  /** 部门名称。 */
  deptName: string;
  /** 部门编码。 */
  deptCode: string;
  /** 上级部门 ID，根部门为空。 */
  parentId: AuthEntityId | null;
  /** 部门是否启用。 */
  status: AuthEntityStatus;
}

/** 当前登录用户的详细资料。 */
export interface IProfileUserInfo extends IProfileAuditFields {
  /** 登录账号。 */
  account: string;
  /** 用户昵称。 */
  username: string;
  /** 手机号。 */
  phone: string | null;
  /** 邮箱。 */
  email: string | null;
  /** 头像地址。 */
  avatar: string | null;
  /** 性别。 */
  gender: "unknown" | "male" | "female";
  /** 用户是否启用。 */
  status: AuthEntityStatus;
  /** 所属部门 ID。 */
  deptId: AuthEntityId | null;
  /** 最后登录 IP。 */
  lastLoginIp: string | null;
  /** 最后登录时间。 */
  lastLoginAt: string | null;
  /** 最后修改密码时间。 */
  passwordUpdatedAt: string | null;
  /** 所属部门详情。 */
  department: IProfileDepartment | null;
  /** 当前用户已启用的角色。 */
  roles: IProfileRole[];
  /** 当前用户的岗位。 */
  posts: IProfilePost[];
  /** 是否为超级管理员。 */
  isAdmin: boolean;
}

/** Profile 中的菜单类型：目录负责分组，菜单对应页面，按钮不生成页面路由。 */
export type ProfileMenuType = "directory" | "menu" | "button";

/** Profile 返回的当前用户可见菜单节点。 */
export interface IProfileMenu {
  /** 菜单雪花 ID。 */
  id: AuthEntityId;
  /** 上级菜单 ID，根节点为空。 */
  parentId: AuthEntityId | null;
  /** 菜单展示名称。 */
  menuName: string;
  /** 菜单节点类型。 */
  menuType: ProfileMenuType;
  /** 站内路由地址。 */
  routePath: string | null;
  /** 对应 src/views 下的组件路径。 */
  component: string | null;
  /** 页面或操作的权限标识。 */
  permissionCode: string | null;
  /** 菜单图标名称。 */
  icon: string | null;
  /** 显示顺序。 */
  sort: number;
  /** 是否在菜单中显示。 */
  visible: boolean;
  /** 页面是否启用 KeepAlive 缓存。 */
  cacheable: boolean;
  /** 外链地址；非空时点击菜单会打开该地址。 */
  externalLink: string | null;
  /** 子菜单。 */
  children: IProfileMenu[];
}

/** GET /auth/profile 响应体：一次返回用户、权限和动态菜单。 */
export interface IUserProfile {
  /** 当前登录用户。 */
  userInfo: IProfileUserInfo;
  /** 当前用户全部权限标识，按钮鉴权以此字段为准。 */
  permissions: string[];
  /** 当前用户可见的动态菜单树。 */
  menus: IProfileMenu[];
}

/** GET /auth/captcha 响应体 */
export interface ICaptchaResponse {
  /** 验证码功能是否开启 */
  enabled: boolean;
  /** 验证码 key，登录时需回传 */
  captchaKey?: string;
  /** 验证码图片，推荐 data:image/*、图片路径或后端净化后的 SVG 字符串 */
  img?: string;
  /** 验证码有效秒数。 */
  expireIn: number;
}
