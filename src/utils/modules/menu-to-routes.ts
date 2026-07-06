import type { IMenu } from "@/api/types";
import type { RouteRecordRaw } from "vue-router";
import { getMenuType, isSidebarMenuNode, resolveMenuNavPath } from "./menu-to-options";
import { isNumericTrue } from "./number-boolean";

/** Vite 预扫描的视图模块，用于将后端 component 字段映射为懒加载组件 */
const viewModules = import.meta.glob("@/views/**/*.vue");

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
const pathToRouteName = (fullPath: string, menuId: number) => {
  const base = fullPath
    .replace(/^\//, "")
    .split(/[/\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return base || `Menu${menuId}`;
};

/** 解析后端 component 字段为 Vue 组件懒加载函数 */
export const resolveViewComponent = (component?: string | null) => {
  if (!component?.trim()) return undefined;

  const normalized = component.trim().replace(/^\/+/, "").replace(/\.vue$/i, "");
  const targetSuffix = `/views/${normalized}.vue`.replace(/\\/g, "/");

  const matchedKey = Object.keys(viewModules).find((key) =>
    key.replace(/\\/g, "/").endsWith(targetSuffix),
  );

  if (!matchedKey) {
    console.warn(`[router] 未找到视图组件: views/${normalized}.vue`);
    return undefined;
  }

  return viewModules[matchedKey];
};

const parseRouteQuery = (query?: string | null): Record<string, unknown> | undefined => {
  if (!query?.trim()) return undefined;

  try {
    return JSON.parse(query) as Record<string, unknown>;
  } catch {
    console.warn("[router] 路由参数 JSON 解析失败:", query);
    return undefined;
  }
};

/** 是否应生成路由（排除按钮、外链、无组件的菜单页） */
const isRouteMenuNode = (menu: IMenu, fullPath: string) => {
  if (!isSidebarMenuNode(menu)) return false;
  if (isExternalPath(fullPath)) return false;
  if (isNumericTrue(menu.isFrame)) return false;

  const type = getMenuType(menu);
  if (type === "F") return false;
  if (type === "C" && !menu.component?.trim()) return false;

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

/** 收集路由树中所有 route.name，便于注销动态路由 */
export const collectRouteNames = (routes: RouteRecordRaw[]): string[] => {
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
 * 将后端菜单树转换为 vue-router 路由配置。
 * 目录(M)生成嵌套路由，菜单(C)生成叶子路由；按钮(F)与外链不参与注册。
 */
export const menusToRoutes = (menus: IMenu[], parentPath = ""): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = [];

  menus.forEach((menu) => {
    const type = getMenuType(menu);
    const fullPath = resolveMenuNavPath(menu.path, parentPath);

    if (!isRouteMenuNode(menu, fullPath)) return;

    const childParentPath = fullPath;
    const childRoutes = menu.children?.length ? menusToRoutes(menu.children, childParentPath) : undefined;
    const routePath = toRouteSegment(fullPath, parentPath);

    const route = {
      path: routePath,
      name: pathToRouteName(fullPath, menu.id),
      meta: {
        title: menu.menuName,
        icon: menu.icon ?? undefined,
        keepAlive: isNumericTrue(menu.isCache),
        menuId: menu.id,
        permission: menu.permission ?? undefined,
      },
    } as unknown as RouteRecordRaw;

    if (type === "C") {
      route.component = resolveViewComponent(menu.component);
      const query = parseRouteQuery(menu.query);
      if (query) {
        route.props = query;
      }
    }

    if (childRoutes?.length) {
      route.children = childRoutes;
      const redirectPath = findFirstNavigablePath(childRoutes, fullPath);
      if (redirectPath) {
        route.redirect = redirectPath;
      }
    }

    // 纯目录且无子路由时不注册
    if (type === "M" && (!childRoutes || childRoutes.length === 0) && !menu.path?.trim()) {
      return;
    }

    routes.push(route);
  });

  return routes;
};
