import type { RouteLocation } from "vue-router";

/**
 * 前置守卫
 * @params { RouteLocation } to 即将要进入的目标路由
 * @params { RouteLocation } from 正要离开的路由
 * @returns {Boolean | String | Object} 是否放行
 */ export const GuardBefore = (_to: RouteLocation, _from: RouteLocation) => {
  return true;
};
