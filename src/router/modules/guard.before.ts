import { useMenuStore, useUserStore } from "@/stores";
import type { RouteLocation } from "vue-router";
import { getKnownRoutePermission } from "./permission-map";
import { FORBIDDEN_ROUTE_NAME, LOGIN_ROUTE_NAME } from "./routes";

/**
 * 前置守卫
 * @params { RouteLocation } to 即将要进入的目标路由
 * @params { RouteLocation } from 正要离开的路由
 * @returns {Boolean | String | Object} 是否放行
 */
export const GuardBefore = async (to: RouteLocation, _from: RouteLocation) => {
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  let isLoggedIn = Boolean(userStore.accessToken);
  const isLoginPage = to.name === LOGIN_ROUTE_NAME;

  if (!isLoggedIn && userStore.refreshToken) {
    isLoggedIn = await userStore.refreshSession();
  }

  if (isLoginPage) {
    if (isLoggedIn) {
      await userStore.loadProfile().catch(() => undefined);
      return { name: "Home" };
    }

    return true;
  }

  if (!isLoggedIn) {
    return {
      name: LOGIN_ROUTE_NAME,
      query: to.fullPath === "/" ? undefined : { redirect: to.fullPath },
    };
  }

  try {
    await userStore.loadProfile();
  } catch {
    userStore.resetSession();
    return { name: LOGIN_ROUTE_NAME };
  }

  if (!menuStore.routesReady) {
    try {
      await menuStore.initRoutes();
      return {
        path: to.fullPath,
        replace: true,
        query: to.query,
        hash: to.hash,
      };
    } catch {
      await userStore.logout();
      return { name: LOGIN_ROUTE_NAME };
    }
  }

  /**
   * 动态菜单路由由 /auth/menus 生成，能注册出来就说明后端已经允许当前用户看到该页面。
   * 这里不再对动态菜单页做二次 permission 拦截，避免“菜单可见但点击进 403”。
   * permission-map 仍用于未注册的已知业务路径：直接输入无权限路径时进入 403，而不是 404。
   */
  const isAuthorizedMenuRoute = typeof to.meta?.menuId === "number";
  const routePermission = isAuthorizedMenuRoute ? undefined : getKnownRoutePermission(to.path);

  if (typeof routePermission === "string" && routePermission && !userStore.hasPermission(routePermission)) {
    return { name: FORBIDDEN_ROUTE_NAME, replace: true };
  }

  return true;
};
