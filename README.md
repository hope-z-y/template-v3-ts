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

所有 `VITE_` 变量都会被打进前端产物，不能放真正的密钥。密码 RSA 加密只用于避免明文提交，不替代 HTTPS、后端哈希和风控策略。

## 模板约定

- 业务路由 URL 使用 `/system-management/...`。
- 页面源码放在 `src/views/system-management`。
- 后端菜单 component 字段使用 `system-management/user-management/index` 这类相对路径。
- 旧拼写 `system-managment` 不做兼容映射，菜单数据发现错误时应直接修正。
- API 函数导出始终使用 PascalCase 命名，例如 `GetUserList`、`CreateNotice`、`UploadFile`；不允许使用 camelCase API 名称。
- 后端响应统一为 `{ code, data, message }`，新增类型使用 `ApiResponse<T>`。
- 后端雪花 ID 与外键一律按 `string` 使用；分页响应统一为 `{ total, rows }`。
- 系统管理接口使用 `/system/user`、`/system/department`、`/system/role` 等单数资源路径。
- 新增用户必须显式设置初始密码，模板不内置默认弱口令。

更多契约见：

- [认证契约](docs/auth-contract.md)
- [菜单契约](docs/menu-contract.md)
- [模块开发规范](docs/module-guide.md)

## 权限

模板支持页面级和按钮级权限：

```vue
<Permission value="system:user:create">
  <NButton type="primary">新增</NButton>
</Permission>

<NButton v-permission="'system:user:delete'">删除</NButton>
```

页面菜单来自 `GET /auth/profile` 返回的 `menus`，按钮权限统一以同一响应中的 `permissions` 为准。

## 部署

生产构建：

```bash
pnpm build
```

Nginx 需要把前端路由回退到 `index.html`：

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:8080/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /uploads/ {
  proxy_pass http://127.0.0.1:8080/uploads/;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

后端数据库升级后执行 `pnpm typeorm:migration:run`，以创建通知收件箱并写入通知公告、工作台权限。通知发布支持全体、部门、角色和指定用户，未来发布时间由后端定时分发。
