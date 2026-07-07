# 菜单契约

菜单树由 `GET /auth/menus` 返回，前端用于侧边栏、动态路由、按钮权限和全局搜索。

## 关键字段

- `menuType`：`M` 目录，`C` 页面，`F` 按钮。
- `menuName`：展示名称。
- `path`：路由路径，页面建议使用 `/system-management/user-management`。
- `component`：页面组件路径，建议使用 `system-management/user-management/index`。
- `permission`：权限标识，按钮节点必填。
- `visible`：`1` 展示，`0` 隐藏。
- `status`：`1` 启用，`0` 禁用。
- `isCache`：`1` 开启 KeepAlive，`0` 不缓存。
- `isFrame`：`1` 外链，`0` 内部路由。

## 权限规则

后端菜单树应当按当前用户过滤。动态菜单页能被注册出来，就表示当前用户允许访问该页面；前端不会再用页面 `permission` 做二次拦截，避免出现“菜单可见但点击进入 403”。

按钮权限节点不注册为路由。默认情况下，按钮是否可见以 `/auth/profile.permissions` 为准。

只有设置 `VITE_TRUST_MENU_PERMISSIONS=true` 时，前端才会把菜单树中 `menuType === "F"` 的 `permission` 合并进用户权限集合。这个开关要求后端菜单树已经按当前用户权限过滤。

模板内置模块还维护了 `src/router/modules/permission-map.ts`，用于直接访问已知业务路径时判断 403。新增业务模块时，如果希望未注册但已知的路径显示 403，请同步补充该映射。

## 目录拼写

源码目录和菜单 `component` 字段统一使用 `system-management`。旧拼写 `system-managment` 属于数据错误，前端不会静默映射到正确目录；发现后请修正菜单数据。

## 内置模块 URL

模板内置模块会以正确的 `component` 推导标准 URL。例如 `system-management/user-management/index` 会导航到 `/system-management/user-management`。这样即使后端 `path` 暂时还是短路径，也不会破坏模板固定 URL。
