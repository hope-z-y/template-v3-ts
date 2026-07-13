import type { IProfileMenu } from "@/api/types";

/**
 * 模板内置页面的 component -> 标准业务路由。
 *
 * 后端菜单数据有时会先更新 component，但 routePath 仍保留短路径（例如 user）。
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

/**
 * NormalizeMenuComponent
 * 统一 component 字段写法，便于和内置映射做精确匹配。
 * 会去除首尾空白、反斜杠转正斜杠、去掉前导斜杠、去掉 views 前缀与 .vue 后缀。
 *
 * @param component - 后端菜单的 component 字段，允许为 undefined 或 null
 * @returns string | undefined - 规范化后的组件路径；入参为空时返回 undefined
 */
export const NormalizeMenuComponent = (component?: string | null) => {
  return component
    ?.trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^src\/views\//, "")
    .replace(/^views\//, "")
    .replace(/\.vue$/i, "");
};

/**
 * GetBuiltinRoutePath
 * 根据菜单 component 获取模板内置模块的标准路由路径。
 *
 * @param menu - 至少包含 component 字段的菜单对象
 * @returns string | undefined - 命中内置映射时返回标准路径，否则返回 undefined
 */
export const GetBuiltinRoutePath = (menu: Pick<IProfileMenu, "component">) => {
  const component = NormalizeMenuComponent(menu.component);
  if (!component) return undefined;
  return BUILTIN_COMPONENT_PATH_MAP.get(component);
};
