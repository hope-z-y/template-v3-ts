import type { IMenu } from "@/api/types";
import { getBuiltinRoutePath } from "./menu-route-contract";
import { isNumericTrue } from "./number-boolean";

/** 侧边栏菜单项（与 Naive UI MenuOption 结构兼容） */
export type RouteMenuOption = {
  label: string;
  key: string;
  iconName?: string;
  navigable?: boolean;
  href?: string;
  permission?: string;
  children?: RouteMenuOption[];
};

export const HOME_PATH = "/home";

/** 无权限时也始终展示的首页菜单 */
export const HOME_MENU_OPTION: RouteMenuOption = {
  label: "首页",
  key: HOME_PATH,
  iconName: "AlignCenterHorizontal20Regular",
  navigable: true,
};

const isExternalPath = (path: string) => /^https?:\/\//i.test(path);

/** 统一菜单类型为大写 M/C/F */
export const getMenuType = (menu: IMenu) => menu.menuType.trim().toUpperCase();

/** 将接口字段（含 snake_case）规范为 IMenu */
export const normalizeMenuNode = (raw: Record<string, unknown>): IMenu => {
  const childSource = raw.children ?? raw.childList ?? raw.subMenus;
  const children = Array.isArray(childSource)
    ? childSource.map((child) => normalizeMenuNode(child as Record<string, unknown>))
    : undefined;

  return {
    id: Number(raw.id ?? raw.menuId ?? raw.menu_id ?? 0),
    parentId: Number(raw.parentId ?? raw.parent_id ?? 0),
    menuType: String(raw.menuType ?? raw.menu_type ?? ""),
    menuName: String(raw.menuName ?? raw.menu_name ?? ""),
    permission: (raw.permission ?? raw.perms ?? null) as string | null,
    path: (raw.path as string | null | undefined) ?? null,
    component: (raw.component as string | null | undefined) ?? null,
    query: (raw.query as string | null | undefined) ?? null,
    icon: (raw.icon as string | null | undefined) ?? null,
    sort: Number(raw.sort ?? raw.orderNum ?? raw.order_num ?? 0),
    visible: Number(raw.visible ?? 1),
    status: Number(raw.status ?? 1),
    isFrame: Number(raw.isFrame ?? raw.is_frame ?? 0),
    isCache: Number(raw.isCache ?? raw.is_cache ?? 0),
    createdAt: String(raw.createdAt ?? raw.create_time ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.update_time ?? ""),
    children,
  };
};

/** 规范化菜单树数组 */
export const normalizeMenuTree = (menus: unknown): IMenu[] => {
  if (!Array.isArray(menus)) return [];
  return menus.map((item) => normalizeMenuNode(item as Record<string, unknown>));
};

/** 拼接菜单导航路径 */
export const resolveMenuNavPath = (path: string | null | undefined, parentPath = ""): string => {
  const raw = path?.trim() ?? "";
  if (!raw) return parentPath;
  if (isExternalPath(raw)) return raw;
  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/";

  const base = parentPath.replace(/\/+$/, "");
  return base ? `${base}/${raw}` : `/${raw}`;
};

/**
 * 菜单最终导航路径。
 * 已知内置模块优先使用模板标准 URL，避免后端 path 未迁移时出现点击 404。
 */
export const resolveMenuRoutePath = (menu: IMenu, parentPath = ""): string => {
  return getBuiltinRoutePath(menu) ?? resolveMenuNavPath(menu.path, parentPath);
};

/** 是否应在侧边栏展示（目录/菜单、visible=1、status=1） */
export const isSidebarMenuNode = (menu: IMenu) => {
  const type = getMenuType(menu);
  if (!type || type === "F") return false;
  if (!isNumericTrue(menu.visible)) return false;
  if (!isNumericTrue(menu.status)) return false;
  return true;
};

/**
 * 将后端菜单树转换为 Naive UI 侧边栏选项。
 * 图标、标题、路径均来自接口数据。
 */
export const menusToOptions = (menus: IMenu[], parentPath = ""): RouteMenuOption[] => {
  const options: RouteMenuOption[] = [];

  menus.forEach((menu) => {
    if (!isSidebarMenuNode(menu)) return;

    const type = getMenuType(menu);
    const fullPath = resolveMenuRoutePath(menu, parentPath);
    const childParentPath = isExternalPath(fullPath) ? parentPath : fullPath;
    const children = menu.children?.length ? menusToOptions(menu.children, childParentPath) : undefined;

    // 纯目录且无可见子节点、自身也无路径时跳过
    if (type === "M" && (!children || children.length === 0) && !menu.path?.trim()) {
      return;
    }

    const external = isExternalPath(fullPath);
    const option: RouteMenuOption = {
      label: menu.menuName,
      key: external ? `external-${menu.id}` : fullPath || `menu-${menu.id}`,
      iconName: menu.icon ?? undefined,
      permission: menu.permission ?? undefined,
      navigable: type === "C" || external || (type === "M" && Boolean(menu.path?.trim())),
    };

    if (external) {
      option.href = fullPath;
    }

    if (children?.length) {
      option.children = children;
    }

    options.push(option);
  });

  return options;
};

const containsHomeMenu = (items?: RouteMenuOption[]): boolean => {
  if (!items?.length) return false;
  return items.some((item) => item.key === HOME_PATH || containsHomeMenu(item.children));
};

/** 保证侧边栏始终包含首页入口 */
export const ensureHomeMenuOption = (options: RouteMenuOption[]): RouteMenuOption[] => {
  if (containsHomeMenu(options)) return options;
  return [HOME_MENU_OPTION, ...options];
};

/** 从菜单树构建 path -> icon 映射，供标签栏等使用 */
export const buildMenuIconMap = (options: RouteMenuOption[]): Record<string, string> => {
  const map: Record<string, string> = {};

  const walk = (items: RouteMenuOption[]) => {
    items.forEach((item) => {
      if (typeof item.key === "string" && item.iconName && !item.key.startsWith("external-")) {
        map[item.key] = item.iconName;
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(options);
  return map;
};

/** 在菜单树中按 path 查找菜单项 */
export const findMenuOptionByKey = (options: RouteMenuOption[], key: string): RouteMenuOption | undefined => {
  for (const option of options) {
    if (option.key === key) return option;
    if (option.children?.length) {
      const found = findMenuOptionByKey(option.children, key);
      if (found) return found;
    }
  }
  return undefined;
};

/** 收集菜单树中的按钮权限标识，供显式信任菜单权限时作为补充来源。 */
export const collectMenuButtonPermissions = (menus: IMenu[]): string[] => {
  const permissions = new Set<string>();

  const walk = (items: IMenu[]) => {
    items.forEach((item) => {
      const permission = item.permission?.trim();
      if (getMenuType(item) === "F" && permission) {
        permissions.add(permission);
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(menus);
  return Array.from(permissions);
};

/** @deprecated 请使用 collectMenuButtonPermissions，避免误把页面菜单权限当成按钮授权。 */
export const collectMenuPermissions = collectMenuButtonPermissions;
