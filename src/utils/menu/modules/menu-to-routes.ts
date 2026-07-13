import type { IProfileMenu } from "@/api/types";
import type { RouteRecordRaw } from "vue-router";
import { IsSidebarMenuNode, ResolveMenuRoutePath } from "./menu-to-options";

/** Vite 预扫描的视图模块，用于将后端 component 字段映射为懒加载组件 */
const viewModules = import.meta.glob("@/views/**/*.vue");

/** 菜单组件缺失时的兜底页面 */
const notFoundComponent = () => import("@/views/exception/404.vue");

/** 容器路由名称，动态路由挂载在其 children 下 */
export const CONTAINER_ROUTE_NAME = "Container";

const isExternalPath = (path: string) => /^https?:\/\//i.test(path);

/** 将完整路径转为相对父级的路由 segment */
const toRouteSegment = (fullPath: string, parentFullPath: string) => {
  const normalized = fullPath.replace(/\/+$/, "") || "/";
  const parent = parentFullPath.replace(/\/+$/, "");

  if (parent && parent !== "/") {
    const prefix = `${parent}/`;
    if (normalized.startsWith(prefix)) {
      return normalized.slice(prefix.length);
    }
  }

  return normalized.replace(/^\//, "");
};

/** path -> PascalCase 路由名 */
const pathToRouteName = (fullPath: string, menuId: string) => {
  const base = fullPath
    .replace(/^\//, "")
    .split(/[/\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return base || `Menu${menuId}`;
};

/**
 * ResolveViewComponent
 * 解析后端 component 字段为 Vue 组件懒加载函数；找不到时回退到 404 页面。
 *
 * @param component - 后端菜单的 component 字段，允许为 undefined 或 null
 * @returns (() => Promise<unknown>) - Vite glob 匹配到的懒加载函数，或 404 兜底
 */
export const ResolveViewComponent = (component?: string | null) => {
  if (!component?.trim()) return notFoundComponent;

  const normalized = component
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.vue$/i, "");
  const targetSuffix = `/views/${normalized}.vue`.replace(/\\/g, "/");

  const matchedKey = Object.keys(viewModules).find((key) => key.replace(/\\/g, "/").endsWith(targetSuffix));

  if (!matchedKey) {
    console.warn(`[router] 未找到视图组件: views/${normalized}.vue`);
    return notFoundComponent;
  }

  return viewModules[matchedKey];
};

/** 是否应生成路由（排除按钮、外链、无组件的菜单页） */
const isRouteMenuNode = (menu: IProfileMenu, fullPath: string) => {
  if (!IsSidebarMenuNode(menu)) return false;
  if (isExternalPath(fullPath)) return false;
  if (menu.externalLink?.trim()) return false;
  if (menu.menuType === "button") return false;
  if (menu.menuType === "menu" && !menu.component?.trim()) return false;

  return true;
};

const findFirstNavigablePath = (routes: RouteRecordRaw[], parentPath = ""): string | undefined => {
  for (const route of routes) {
    const segment = String(route.path).replace(/^\//, "");
    const fullPath = `${parentPath}/${segment}`.replace(/\/+/g, "/");

    if (route.children?.length) {
      const childPath = findFirstNavigablePath(route.children, fullPath);
      if (childPath) return childPath;
      continue;
    }

    if (route.component) {
      return fullPath;
    }
  }

  return undefined;
};

/**
 * CollectRouteNames
 * 收集路由树中所有 route.name，便于注销动态路由。
 *
 * @param routes - vue-router 路由配置数组
 * @returns string[] - 所有字符串类型的路由 name 列表
 */
export const CollectRouteNames = (routes: RouteRecordRaw[]): string[] => {
  const names: string[] = [];

  const walk = (items: RouteRecordRaw[]) => {
    items.forEach((route) => {
      if (typeof route.name === "string") {
        names.push(route.name);
      }
      if (route.children?.length) {
        walk(route.children);
      }
    });
  };

  walk(routes);
  return names;
};

/**
 * MenusToRoutes
 * 将后端菜单树转换为 vue-router 路由配置。
 * directory 生成嵌套路由，menu 生成页面路由；button 与外链不参与注册。
 *
 * @param menus - Profile 菜单树数组
 * @param parentPath - 父级已解析完整路径，默认为空字符串
 * @returns RouteRecordRaw[] - 可挂载到 Container 下的路由配置
 */
export const MenusToRoutes = (menus: IProfileMenu[], parentPath = ""): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = [];

  menus.forEach((menu) => {
    const fullPath = ResolveMenuRoutePath(menu, parentPath);

    if (!isRouteMenuNode(menu, fullPath)) return;

    const childParentPath = fullPath;
    const childRoutes = menu.children?.length ? MenusToRoutes(menu.children, childParentPath) : undefined;
    const routePath = toRouteSegment(fullPath, parentPath);

    const routeMeta = {
      title: menu.menuName,
      icon: menu.icon ?? undefined,
      keepAlive: menu.cacheable,
      menuId: menu.id,
      permission: menu.permissionCode ?? undefined,
    };

    const route: RouteRecordRaw =
      menu.menuType === "menu"
        ? {
            path: routePath,
            name: pathToRouteName(fullPath, menu.id),
            component: ResolveViewComponent(menu.component),
            children: childRoutes ?? [],
            meta: routeMeta,
          }
        : {
            path: routePath,
            name: pathToRouteName(fullPath, menu.id),
            component: null,
            children: childRoutes ?? [],
            meta: routeMeta,
          };

    if (childRoutes?.length) {
      const redirectPath = findFirstNavigablePath(childRoutes, fullPath);
      if (redirectPath) {
        route.redirect = redirectPath;
      }
    }

    // 纯目录且无子路由时不注册
    if (menu.menuType === "directory" && (!childRoutes || childRoutes.length === 0) && !menu.routePath?.trim()) {
      return;
    }

    routes.push(route);
  });

  return routes;
};
