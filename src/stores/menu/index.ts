import { GetUserMenus } from "@/api/auth";
import type { IMenu } from "@/api/types";
import { registerDynamicRoutes, resetDynamicRoutes } from "@/router/modules/dynamic-routes";
import { STORE_KEY } from "@/utils/modules/store-key";
import {
  buildMenuIconMap,
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

  const applyMenuTree = (tree: IMenu[]) => {
    menuTree.value = tree;
    const options = ensureHomeMenuOption(menusToOptions(tree));
    menus.value = options;
    iconByPath.value = buildMenuIconMap(options);
  };

  const fetchMenus = async (force = false) => {
    if (!force && pendingInit) {
      return pendingInit;
    }

    pendingInit = (async () => {
      try {
        loading.value = true;
        const data = await GetUserMenus();
        applyMenuTree(normalizeMenuTree(data));
      } catch {
        applyMenuTree([]);
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
