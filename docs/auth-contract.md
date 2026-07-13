# 认证契约

## 登录流程

1. 前端调用 `GET /auth/public-key` 获取 RSA 公钥。
2. 前端用公钥加密密码，携带必填的 `captchaCode`、`captchaKey` 调用 `POST /auth/login`。
3. 后端返回 `{ accessToken, refreshToken, expiresIn }`。
4. 前端调用一次 `GET /auth/profile`，同时获取当前用户、权限和动态菜单并注册路由。

## Profile 响应

```ts
interface IUserProfile {
  userInfo: IProfileUserInfo;
  permissions: string[];
  menus: IProfileMenu[];
}
```

角色编码直接读取 `userInfo.roles[].roleKey`，例如 `admin`、`operator`。`permissions` 使用按钮或接口权限标识，例如 `system:user:create`。

前端直接使用当前后端契约，不兼容旧的 `user`、顶层 `roles` 或 `roleCode` 字段。管理员满足以下任一条件即可获得前端全量按钮权限：

- `userInfo.roles[].roleKey` 包含 `admin`。
- `permissions` 包含 `*:*:*`。
- `userInfo.isAdmin` 为 `true`。

## 登录页约束

- 登录表单先做账号、密码、验证码必填校验，再提交接口。
- 公钥加载中禁止提交；公钥加载失败时不允许发送明文密码。
- 验证码使用 `img` 渲染，不使用 `v-html` 注入任意 HTML。
- 验证码响应包含 `expireIn`（秒），登录请求始终回传验证码和验证码标识。
- 登录回跳只接受站内路径，例如 `/home`，不接受外部 URL。

## Token 策略

默认 `VITE_AUTH_STORAGE_STRATEGY=memory-refresh`：

- `accessToken` 仅保存在内存。
- `refreshToken` 保存在 `sessionStorage`。

兼容策略 `legacy-localStorage` 会把 access token 和 refresh token 都放到 `localStorage`，仅用于过渡迁移。

企业生产环境更推荐后端使用 HttpOnly refresh cookie。

退出登录调用 `POST /auth/logout`，请求体为 `{ refreshToken }`；前端在清理本地会话前回传当前 refresh token。

## 权限来源

前端只使用 `GET /auth/profile` 返回的 `permissions` 判断按钮和接口权限。`menus` 已由后端按当前用户过滤，只负责侧边栏和动态路由，不参与补充授权。
