import { useUserStore } from "@/stores";
import type { RouteLocation } from "vue-router";

/**
 * 前置守卫
 * @params { RouteLocation } to 即将要进入的目标路由
 * @params { RouteLocation } from 正要离开的路由
 * @returns {Boolean | String | Object} 是否放行
 */
export const GuardBefore = (to: RouteLocation, _from: RouteLocation) => {
  const { accessToken } = useUserStore();
  const isLoggedIn = Boolean(accessToken);
  const isLoginPage = to.name === "Login";

  if (isLoginPage) {
    if (isLoggedIn) {
      return { name: "Home" };
    }

    return true;
  }

  if (!isLoggedIn) {
    return {
      name: "Login",
      query: to.fullPath === "/" ? undefined : { redirect: to.fullPath },
    };
  }

  return true;
};
