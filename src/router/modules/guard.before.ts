import { useMenuStore, useUserStore } from "@/stores";
import type { RouteLocation } from "vue-router";
import { LOGIN_ROUTE_NAME } from "./routes";

/**
 * 前置守卫
 * @params { RouteLocation } to 即将要进入的目标路由
 * @params { RouteLocation } from 正要离开的路由
 * @returns {Boolean | String | Object} 是否放行
 */
export const GuardBefore = async (to: RouteLocation, _from: RouteLocation) => {
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  const isLoggedIn = Boolean(userStore.accessToken);
  const isLoginPage = to.name === LOGIN_ROUTE_NAME;

  if (isLoginPage) {
    if (isLoggedIn) {
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

  return true;
};
