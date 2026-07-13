# 菜单契约

菜单树由 `GET /auth/profile` 的 `menus` 字段返回，前端用于侧边栏、动态路由和全局搜索。

菜单管理 CRUD 使用 `/system/menu`，树接口为 `GET /system/menu/tree`。写操作返回新建或更新实体的字符串 ID。

## 关键字段

- `id`、`parentId`：雪花 ID，前端必须保留为字符串，不能转成 `number`。
- `menuType`：`directory` 目录，`menu` 页面，`button` 按钮。
- `menuName`：展示名称。
- `routePath`：站内路由路径，页面建议使用 `/system-management/user-management`。
- `component`：页面组件路径，建议使用 `system-management/user-management/index`。
- `permissionCode`：权限标识。
- `visible`：是否在菜单中展示。
- `cacheable`：是否开启 KeepAlive。
- `externalLink`：外链 URL；非空时不注册站内路由。
- `status`：`enabled` 或 `disabled`；`visible`、`cacheable` 均为 boolean。

## 权限规则

后端菜单树应当按当前用户过滤。动态菜单页能被注册出来，就表示当前用户允许访问该页面；前端不会再用页面 `permission` 做二次拦截，避免出现“菜单可见但点击进入 403”。

后端 Profile 菜单树会排除 `button` 节点，因此按钮不会注册为路由。按钮是否可见统一以同一 Profile 响应的 `permissions` 为准。

模板内置模块还维护了 `src/router/modules/permission-map.ts`，用于直接访问已知业务路径时判断 403。新增业务模块时，如果希望未注册但已知的路径显示 403，请同步补充该映射。

## 目录拼写

源码目录和菜单 `component` 字段统一使用 `system-management`。旧拼写 `system-managment` 属于数据错误，前端不会静默映射到正确目录；发现后请修正菜单数据。

## 内置模块 URL

模板内置模块会以正确的 `component` 推导标准 URL。例如 `system-management/user-management/index` 会导航到 `/system-management/user-management`。这样即使后端 `routePath` 暂时还是短路径，也不会破坏模板固定 URL。
