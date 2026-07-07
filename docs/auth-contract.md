# 认证契约

## 登录流程

1. 前端调用 `GET /auth/public-key` 获取 RSA 公钥。
2. 前端用公钥加密密码后调用 `POST /auth/login`。
3. 后端返回 `{ accessToken, refreshToken, expiresIn }`。
4. 前端调用 `GET /auth/profile` 获取当前用户、角色和权限。
5. 前端调用 `GET /auth/menus` 获取动态菜单并注册路由。

## Profile 响应

```ts
interface IUserProfile {
  user: IUser;
  roles: string[];
  permissions: string[];
}
```

`roles` 建议使用角色编码，例如 `admin`、`operator`。`permissions` 使用按钮或接口权限标识，例如 `system:user:add`。

前端会兼容常见的嵌套角色结构，例如 `user.userRoles[].role.roleCode`。管理员需要满足以下任一条件才会获得前端全量按钮权限：

- `roles` 或嵌套角色中包含 `admin`。
- `permissions` 包含 `*:*:*`。
- profile 或 user 上显式返回 `isAdmin: true` / `superAdmin: true`。

## 登录页约束

- 登录表单先做账号、密码、验证码必填校验，再提交接口。
- 公钥加载中禁止提交；公钥加载失败时不允许发送明文密码。
- 验证码使用 `img` 渲染，不使用 `v-html` 注入任意 HTML。
- 登录回跳只接受站内路径，例如 `/home`，不接受外部 URL。

## Token 策略

默认 `VITE_AUTH_STORAGE_STRATEGY=memory-refresh`：

- `accessToken` 仅保存在内存。
- `refreshToken` 保存在 `sessionStorage`。

兼容策略 `legacy-localStorage` 会把 access token 和 refresh token 都放到 `localStorage`，仅用于过渡迁移。

企业生产环境更推荐后端使用 HttpOnly refresh cookie。

## 权限来源

默认情况下，前端只信任 `GET /auth/profile` 返回的 `permissions`。菜单树里的按钮权限只用于渲染菜单协议和调试，不自动授予用户权限。

如果后端能保证 `GET /auth/menus` 返回的菜单树已经按当前用户权限过滤，可以设置 `VITE_TRUST_MENU_PERMISSIONS=true`，前端会把按钮节点权限作为 `permissions` 的补充来源。
