import type { RouteLocation, RouteLocationNormalizedLoaded, RouteRecordRaw } from "vue-router";

/** 容器布局路由名，动态路由挂载点 */
export const CONTAINER_ROUTE_NAME = "Container";

/** 登录页路由名 */
export const LOGIN_ROUTE_NAME = "Login";

/** 无权限页路由名 */
export const FORBIDDEN_ROUTE_NAME = "Forbidden";

/** 未找到页路由名 */
export const NOT_FOUND_ROUTE_NAME = "NotFound";

/** 服务异常页路由名 */
export const SERVER_ERROR_ROUTE_NAME = "ServerError";

/** 固定路由：登录页 + 容器壳（首页始终可访问） */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: CONTAINER_ROUTE_NAME,
    component: () => import("@/views/container/index.vue"),
    redirect: (_to: RouteLocation, _from: RouteLocationNormalizedLoaded) => {
      return "/home";
    },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: { title: "首页", icon: "Home24Regular", affixed: true },
      },
    ],
  },
  {
    path: "/login",
    name: LOGIN_ROUTE_NAME,
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/403",
    name: FORBIDDEN_ROUTE_NAME,
    component: () => import("@/views/exception/403.vue"),
    meta: { title: "暂无权限", noTag: true },
  },
  {
    path: "/500",
    name: SERVER_ERROR_ROUTE_NAME,
    component: () => import("@/views/exception/500.vue"),
    meta: { title: "服务异常", noTag: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: NOT_FOUND_ROUTE_NAME,
    component: () => import("@/views/exception/404.vue"),
    meta: { title: "页面不存在", noTag: true },
  },
];
