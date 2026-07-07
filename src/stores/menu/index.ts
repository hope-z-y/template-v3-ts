import { GetUserMenus } from "@/api/auth";
import type { IMenu } from "@/api/types";
import { registerDynamicRoutes, resetDynamicRoutes } from "@/router/modules/dynamic-routes";
import { STORE_KEY } from "@/utils/modules/store-key";
import {
  buildMenuIconMap,
  collectMenuButtonPermissions,
  ensureHomeMenuOption,
  menusToOptions,
  normalizeMenuTree,
  type RouteMenuOption,
} from "@/utils/modules/menu-to-options";
import { defineStore } from "pinia";
import { ref } from "vue";

/** 菜单与动态路由状态：数据来自 /auth/menus（按角色过滤） */
export const useMenuStore = defineStore(STORE_KEY.MenuStore, () => {
  const menuTree = ref<IMenu[]>([]);
  const menus = ref<RouteMenuOption[]>([]);
  const iconByPath = ref<Record<string, string>>({});
  const loading = ref(false);
  const routesReady = ref(false);

  let pendingInit: Promise<void> | null = null;

  const collectNavigablePaths = (items: RouteMenuOption[]): string[] => {
    const paths: string[] = [];

    const walk = (options: RouteMenuOption[]) => {
      options.forEach((item) => {
        if (item.navigable && !item.href && item.key.startsWith("/")) {
          paths.push(item.key);
        }
        if (item.children?.length) {
          walk(item.children);
        }
      });
    };

    walk(items);
    return paths;
  };

  const applyMenuTree = (tree: IMenu[]) => {
    menuTree.value = tree;
    const options = ensureHomeMenuOption(menusToOptions(tree));
    menus.value = options;
    iconByPath.value = buildMenuIconMap(options);

    import("@/stores/menu-tag").then(({ useMenuTagStore }) => {
      useMenuTagStore().filterByPaths(collectNavigablePaths(options));
    });
  };

  const fetchMenus = async (force = false) => {
    if (!force && pendingInit) {
      return pendingInit;
    }

    pendingInit = (async () => {
      try {
        loading.value = true;
        const data = await GetUserMenus();
        const tree = normalizeMenuTree(data);
        applyMenuTree(tree);

        const { useUserStore } = await import("@/stores/user");
        useUserStore().setMenuPermissions(collectMenuButtonPermissions(tree));
      } catch (error) {
        applyMenuTree([]);
        const { useUserStore } = await import("@/stores/user");
        useUserStore().setMenuPermissions([]);
        throw error;
      } finally {
        loading.value = false;
        pendingInit = null;
      }
    })();

    return pendingInit;
  };

  /** 拉取菜单并注册动态路由（路由守卫 / 登录后调用） */
  const initRoutes = async (force = false) => {
    if (!force && routesReady.value) {
      return;
    }

    await fetchMenus(force);

    const { router } = await import("@/router");
    registerDynamicRoutes(router, menuTree.value);
    routesReady.value = true;
  };

  const getIconByPath = (path: string) => iconByPath.value[path];

  const reset = () => {
    menuTree.value = [];
    menus.value = [];
    iconByPath.value = {};
    import("@/stores/user").then(({ useUserStore }) => {
      useUserStore().setMenuPermissions([]);
    });
    routesReady.value = false;
    pendingInit = null;

    import("@/router").then(({ router }) => {
      resetDynamicRoutes(router);
    });
  };

  return {
    menuTree,
    menus,
    iconByPath,
    loading,
    routesReady,
    fetchMenus,
    initRoutes,
    getIconByPath,
    reset,
  };
});
