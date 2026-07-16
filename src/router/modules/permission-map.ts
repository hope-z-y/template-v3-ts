/**
 * 模板内置模块的路由权限表。
 *
 * 动态菜单仍然是页面注册的主要来源；这里用于处理“用户直接输入已知业务路径，
 * 但当前菜单没有注册该路由”的场景，让无权限访问优先进入 403，而不是误判为 404。
 */
const ROUTE_PERMISSION_MAP = new Map<string, string>([
  ["/system-management/user-management", "system:user:list"],
  ["/system-management/role-management", "system:role:list"],
  ["/system-management/dept-management", "system:department:list"],
  ["/system-management/menu-management", "system:menu:list"],
  ["/system-management/post-management", "system:post:list"],
  ["/system-management/config-management", "system:parameter:list"],
  ["/system-management/dict-management", "system:dict-type:list"],
  ["/system-management/notice-management", "system:notice:list"],
  ["/monitor/login-log", "system:login-log:list"],
  ["/monitor/operation-log", "system:operation-log:list"],
]);

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

export const getKnownRoutePermission = (path: string) => {
  return ROUTE_PERMISSION_MAP.get(normalizePath(path));
};
