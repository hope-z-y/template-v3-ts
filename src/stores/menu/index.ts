import type { IProfileMenu } from "@/api/types";
import { registerDynamicRoutes, resetDynamicRoutes } from "@/router/modules/dynamic-routes";
import { BuildMenuIconMap, EnsureHomeMenuOption, MenusToOptions, STORE_KEY, type RouteMenuOption } from "@/utils";
import { defineStore } from "pinia";
import { ref } from "vue";

/** 菜单与动态路由状态：数据来自 /auth/profile.menus（已按当前用户过滤）。 */
export const useMenuStore = defineStore(STORE_KEY.MenuStore, () => {
  const menuTree = ref<IProfileMenu[]>([]);
  const menus = ref<RouteMenuOption[]>([]);
  const iconByPath = ref<Record<string, string>>({});
  const routesReady = ref(false);

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

  /** 把后端菜单树转换为侧边栏数据，并清理已经无权访问的标签页。 */
  const applyMenuTree = (tree: IProfileMenu[]) => {
    menuTree.value = tree;
    const options = EnsureHomeMenuOption(MenusToOptions(tree));
    menus.value = options;
    iconByPath.value = BuildMenuIconMap(options);

    import("@/stores/menu-tag").then(({ useMenuTagStore }) => {
      useMenuTagStore().filterByPaths(collectNavigablePaths(options));
    });
  };

  /**
   * 使用 Profile 已返回的菜单注册动态路由。
   * 此函数不再请求接口，保证一次 Profile 请求即可完成整个登录态初始化。
   */
  const initRoutes = async (tree: IProfileMenu[]) => {
    applyMenuTree(tree);
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

    import("@/router").then(({ router }) => {
      resetDynamicRoutes(router);
    });
  };

  return {
    menuTree,
    menus,
    iconByPath,
    routesReady,
    initRoutes,
    getIconByPath,
    reset,
  };
});
