import type { IProfileMenu } from "@/api/types";
import { CollectRouteNames, CONTAINER_ROUTE_NAME, MenusToRoutes } from "@/utils";
import type { Router } from "vue-router";

const registeredRouteNames = new Set<string>();

/** 动态路由是否已注册 */
export const isDynamicRoutesRegistered = () => registeredRouteNames.size > 0;

/** 根据菜单树注册动态路由到 Container 下 */
export const registerDynamicRoutes = (router: Router, menuTree: IProfileMenu[]) => {
  resetDynamicRoutes(router);

  const routes = MenusToRoutes(menuTree);
  routes.forEach((route) => {
    router.addRoute(CONTAINER_ROUTE_NAME, route);
    CollectRouteNames([route]).forEach((name) => registeredRouteNames.add(name));
  });
};

/** 注销已注册的动态路由（退出登录时调用） */
export const resetDynamicRoutes = (router: Router) => {
  registeredRouteNames.forEach((name) => {
    router.removeRoute(name);
  });
  registeredRouteNames.clear();
};
