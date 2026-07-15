import { useMenuStore, useUserStore } from "@/stores";
import { useLockScreen } from "@/hooks/use-lock-screen";
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

    useLockScreen().clear();
    return true;
  }

  if (!isLoggedIn) {
    return {
      name: LOGIN_ROUTE_NAME,
      query: to.fullPath === "/" ? undefined : { redirect: to.fullPath },
    };
  }

  // 首次进入受保护页面时，loadProfile 会同时注册 Profile 中返回的动态菜单路由。
  const shouldRematchAfterProfile = !menuStore.routesReady;
  try {
    // 正常情况下 Profile 和菜单同时就绪；若状态意外不同步，则强制重新获取一次。
    await userStore.loadProfile(userStore.profileLoaded && shouldRematchAfterProfile);
  } catch {
    userStore.resetSession();
    return { name: LOGIN_ROUTE_NAME };
  }

  if (shouldRematchAfterProfile && menuStore.routesReady) {
    // 当前导航开始时动态路由尚不存在，需要 replace 一次让 vue-router 重新匹配目标页面。
    return {
      path: to.fullPath,
      replace: true,
      query: to.query,
      hash: to.hash,
    };
  }

  /**
   * 动态菜单路由由 /auth/profile.menus 生成，能注册出来就说明后端允许当前用户看到该页面。
   * 这里不再对动态菜单页做二次 permission 拦截，避免“菜单可见但点击进 403”。
   * permission-map 仍用于未注册的已知业务路径：直接输入无权限路径时进入 403，而不是 404。
   */
  const isAuthorizedMenuRoute = typeof to.meta?.menuId === "string";
  const routePermission = isAuthorizedMenuRoute ? undefined : getKnownRoutePermission(to.path);

  if (typeof routePermission === "string" && routePermission && !userStore.hasPermission(routePermission)) {
    return { name: FORBIDDEN_ROUTE_NAME, replace: true };
  }

  return true;
};
