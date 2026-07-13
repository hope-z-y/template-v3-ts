import type { IProfileMenu } from "@/api/types";
import { GetBuiltinRoutePath } from "./menu-route-contract";

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
  iconName: "HomeOutlined",
  navigable: true,
};

const isExternalPath = (path: string) => /^https?:\/\//i.test(path);

/**
 * ResolveMenuNavPath
 * 拼接菜单导航路径：外链原样返回；绝对路径规范化；相对路径相对 parentPath 拼接。
 *
 * @param path - 当前菜单路径，允许为 null 或 undefined
 * @param parentPath - 父级已解析路径，默认为空字符串
 * @returns string - 解析后的完整导航路径
 */
export const ResolveMenuNavPath = (path: string | null | undefined, parentPath = ""): string => {
  const raw = path?.trim() ?? "";
  if (!raw) return parentPath;
  if (isExternalPath(raw)) return raw;
  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/";

  const base = parentPath.replace(/\/+$/, "");
  return base ? `${base}/${raw}` : `/${raw}`;
};

/**
 * ResolveMenuRoutePath
 * 计算菜单最终导航路径。
 * 外链直接使用 externalLink；站内页面优先使用模板内置路径，再回退到后端 routePath。
 *
 * @param menu - Profile 菜单节点
 * @param parentPath - 父级已解析路径，默认为空字符串
 * @returns string - 最终用于导航或生成 key 的路径
 */
export const ResolveMenuRoutePath = (menu: IProfileMenu, parentPath = ""): string => {
  const externalLink = menu.externalLink?.trim();
  if (externalLink) return externalLink;
  return GetBuiltinRoutePath(menu) ?? ResolveMenuNavPath(menu.routePath, parentPath);
};

/**
 * IsSidebarMenuNode
 * 判断菜单节点是否应出现在侧边栏。
 * Profile 已过滤禁用节点；前端只需排除按钮和明确隐藏的节点。
 *
 * @param menu - Profile 菜单节点
 * @returns boolean - 应为侧边栏节点时返回 true
 */
export const IsSidebarMenuNode = (menu: IProfileMenu) => {
  return menu.menuType !== "button" && menu.visible;
};

/**
 * MenusToOptions
 * 将后端菜单树转换为 Naive UI 侧边栏选项。
 * 图标、标题、路径均来自接口数据。
 *
 * @param menus - Profile 菜单树数组
 * @param parentPath - 父级已解析路径，默认为空字符串
 * @returns RouteMenuOption[] - 侧边栏菜单选项树
 */
export const MenusToOptions = (menus: IProfileMenu[], parentPath = ""): RouteMenuOption[] => {
  const options: RouteMenuOption[] = [];

  menus.forEach((menu) => {
    if (!IsSidebarMenuNode(menu)) return;

    const fullPath = ResolveMenuRoutePath(menu, parentPath);
    const childParentPath = isExternalPath(fullPath) ? parentPath : fullPath;
    const children = menu.children?.length ? MenusToOptions(menu.children, childParentPath) : undefined;

    // 纯目录且无可见子节点、自身也无路径时跳过
    if (menu.menuType === "directory" && (!children || children.length === 0) && !menu.routePath?.trim()) {
      return;
    }

    const external = isExternalPath(fullPath);
    const option: RouteMenuOption = {
      label: menu.menuName,
      key: external ? `external-${menu.id}` : fullPath || `menu-${menu.id}`,
      iconName: menu.icon ?? undefined,
      permission: menu.permissionCode ?? undefined,
      navigable:
        menu.menuType === "menu" || external || (menu.menuType === "directory" && Boolean(menu.routePath?.trim())),
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

/**
 * EnsureHomeMenuOption
 * 保证侧边栏始终包含首页入口；若已存在则原样返回。
 *
 * @param options - 当前侧边栏菜单选项树
 * @returns RouteMenuOption[] - 确保含首页后的选项树
 */
export const EnsureHomeMenuOption = (options: RouteMenuOption[]): RouteMenuOption[] => {
  if (containsHomeMenu(options)) return options;
  return [HOME_MENU_OPTION, ...options];
};

/**
 * BuildMenuIconMap
 * 从菜单树构建 path -> iconName 映射，供标签栏等使用。
 *
 * @param options - 侧边栏菜单选项树
 * @returns Record<string, string> - 键为站内路径，值为图标组件名
 */
export const BuildMenuIconMap = (options: RouteMenuOption[]): Record<string, string> => {
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

/**
 * FindMenuOptionByKey
 * 在菜单树中按 key（通常为路径）查找菜单项。
 *
 * @param options - 侧边栏菜单选项树
 * @param key - 目标菜单 key
 * @returns RouteMenuOption | undefined - 找到时返回节点，否则返回 undefined
 */
export const FindMenuOptionByKey = (options: RouteMenuOption[], key: string): RouteMenuOption | undefined => {
  for (const option of options) {
    if (option.key === key) return option;
    if (option.children?.length) {
      const found = FindMenuOptionByKey(option.children, key);
      if (found) return found;
    }
  }
  return undefined;
};
