import type { IMenu } from "@/api/types";

/**
 * 模板内置页面的 component -> 标准业务路由。
 *
 * 后端菜单数据有时会先更新 component，但 path 仍保留旧值（例如 user）。
 * 对这些内置模块，前端以 component 作为页面身份，推导出模板约定的稳定 URL。
 */
const BUILTIN_COMPONENT_PATH_MAP = new Map<string, string>([
  ["system-management/user-management/index", "/system-management/user-management"],
  ["system-management/role-management/index", "/system-management/role-management"],
  ["system-management/dept-management/index", "/system-management/dept-management"],
  ["system-management/menu-management/index", "/system-management/menu-management"],
  ["system-management/post-management/index", "/system-management/post-management"],
  ["system-management/config-management/index", "/system-management/config-management"],
  ["system-management/dict-management/index", "/system-management/dict-management"],
  ["monitor/login-log/index", "/monitor/login-log"],
  ["monitor/operation-log/index", "/monitor/operation-log"],
]);

/** 统一 component 写法，便于和内置映射做精确匹配。 */
export const normalizeMenuComponent = (component?: string | null) => {
  return component
    ?.trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^src\/views\//, "")
    .replace(/^views\//, "")
    .replace(/\.vue$/i, "");
};

/** 根据 component 获取模板内置模块的标准路由路径。 */
export const getBuiltinRoutePath = (menu: Pick<IMenu, "component">) => {
  const component = normalizeMenuComponent(menu.component);
  if (!component) return undefined;
  return BUILTIN_COMPONENT_PATH_MAP.get(component);
};
