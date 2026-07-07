# Template V3 TS

企业级中后台管理系统模板，基于 Vue 3、TypeScript、Vite、Pinia、Vue Router、Naive UI 和 Tailwind CSS。

## 快速开始

```bash
pnpm install
pnpm dev
```

常用脚本：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

## 环境变量

复制 `.env.example` 为 `.env.local` 后按环境调整：

- `VITE_APP_NAME`：系统名称。
- `VITE_API_PREFIX`：前端请求前缀。
- `VITE_PROXY_TARGET`：开发代理目标。
- `VITE_ROUTE_PREFIX`：部署路由前缀。
- `VITE_API_TIMEOUT`：请求超时时间。
- `VITE_AUTH_STORAGE_STRATEGY`：认证存储策略，支持 `memory-refresh` 和 `legacy-localStorage`。
- `VITE_TRUST_MENU_PERMISSIONS`：是否信任菜单树按钮权限，默认 `false`。

所有 `VITE_` 变量都会被打进前端产物，不能放真正的密钥。密码 RSA 加密只用于避免明文提交，不替代 HTTPS、后端哈希和风控策略。

## 模板约定

- 业务路由 URL 使用 `/system-management/...`。
- 页面源码放在 `src/views/system-management`。
- 后端菜单 component 字段使用 `system-management/user-management/index` 这类相对路径。
- 旧拼写 `system-managment` 不做兼容映射，菜单数据发现错误时应直接修正。
- API 新增代码使用 camelCase 导出，旧 PascalCase 导出仅作为兼容。
- 后端响应统一为 `{ code, data, message }`，新增类型使用 `ApiResponse<T>`。
- 新增用户必须显式设置初始密码，模板不内置默认弱口令。

更多契约见：

- [认证契约](docs/auth-contract.md)
- [菜单契约](docs/menu-contract.md)
- [模块开发规范](docs/module-guide.md)

## 权限

模板支持页面级和按钮级权限：

```vue
<Permission value="system:user:add">
  <NButton type="primary">新增</NButton>
</Permission>

<NButton v-permission="'system:user:delete'">删除</NButton>
```

权限默认以 `GET /auth/profile` 返回的 `permissions` 为准。只有在确认后端菜单树已按权限过滤时，才建议把 `VITE_TRUST_MENU_PERMISSIONS` 设为 `true`，将菜单树按钮节点作为补充权限来源。

## 部署

生产构建：

```bash
pnpm build
```

Nginx 需要把前端路由回退到 `index.html`：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
