import { useMenuTagStore } from "@/stores/menu-tag";
import { useGlobalConfig } from "@/hooks";
import type { NavigationFailure, RouteLocationNormalizedLoaded } from "vue-router";

/**
 * 后置守卫
 * @params { RouteLocationNormalized } to 即将要进入的目标路由
 * @params { RouteLocationNormalized } from 正要离开的路由
 * @params { NavigationFailure } failure 导航失败的额外信息
 *
 */
export const GuardAfter = (
  to: RouteLocationNormalizedLoaded,
  _from: RouteLocationNormalizedLoaded,
  failure?: NavigationFailure | void,
): unknown => {
  if (failure) return true;

  useMenuTagStore().addTag(to);
  const { appName } = useGlobalConfig();
  document.title = to.meta.title ? `${String(to.meta.title)} - ${appName.value}` : appName.value;
  return true;
};
