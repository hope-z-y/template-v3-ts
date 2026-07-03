import { router } from "@/router";
import { STORE_KEY } from "@/utils/modules/store-key";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

/**
 * 标签页单项数据结构。
 * 由路由 meta 信息转换而来，用于顶部 menu-tag 栏展示与持久化。
 */
export interface MenuTagItem {
  /** 完整路由路径，如 `/system-management/user-management` */
  path: string;
  /** 展示标题，对应路由 meta.title */
  title: string;
  /** Fluent 图标组件名，对应路由 meta.icon */
  icon?: string;
  /** 是否固定；固定标签不会被批量关闭或单独删除 */
  affixed?: boolean;
}

/** 首页路由路径，始终保留且不可删除 */
const HOME_PATH = "/home";

/** 首页标签默认配置，初始化与重置时使用 */
const HOME_TAG: MenuTagItem = {
  path: HOME_PATH,
  title: "首页",
  icon: "AlignCenterHorizontal20Regular",
  affixed: true,
};

/** 判断是否为首页标签 */
const isHomeTag = (path: string) => path === HOME_PATH;

/**
 * 规范化标签列表：
 * - 保证首页始终存在且位于第一位
 * - 固定标签排在非固定标签之前
 * @param list 待规范化的标签列表
 */
const normalizeTags = (list: MenuTagItem[]): MenuTagItem[] => {
  const withHome = list.some((item) => isHomeTag(item.path)) ? list : [{ ...HOME_TAG }, ...list];

  const rest = withHome.filter((item) => !isHomeTag(item.path));
  const affixed = rest.filter((item) => item.affixed);
  const normal = rest.filter((item) => !item.affixed);

  return [{ ...HOME_TAG }, ...affixed, ...normal];
};

/**
 * 顶部标签页状态管理。
 * - 路由跳转时自动记录标签
 * - 通过 pinia persist 插件持久化 tags，刷新页面后恢复
 * - 退出登录时调用 reset 清空，其余场景不清空
 */
export const useMenuTagStore = defineStore(
  STORE_KEY.MenuTagStore,
  () => {
    /** 当前打开的标签列表，顺序即展示顺序 */
    const tags = ref<MenuTagItem[]>(normalizeTags([]));

    /**
     * 各路由对应的视图刷新计数。
     * 仅用于 RouterView key，不参与持久化。
     */
    const viewKeys = ref<Record<string, number>>({});

    /**
     * 保证首页存在，并将固定标签排到前面。
     * 从缓存恢复、批量关闭或切换固定状态后调用。
     */
    const ensureHomeTag = () => {
      tags.value = normalizeTags(tags.value);
    };

    /** 当前激活的路由路径 */
    const activePath = computed(() => router.currentRoute.value.path);

    /**
     * 判断当前路由是否应加入标签栏。
     * - 需有 meta.title，且 meta.noTag 不为 true
     * - 排除登录页
     * - 仅记录 Container 布局内的子路由
     */
    const shouldRecordTag = (route: RouteLocationNormalizedLoaded) => {
      if (!route.meta?.title || route.meta?.noTag) return false;
      if (route.name === "Login" || route.path === "/login") return false;
      return route.matched.some((record) => record.name === "Container");
    };

    /**
     * 根据路由信息新增标签。
     * 已存在的路径不重复添加；首页仅触发 ensureHomeTag。
     * @param route 导航完成后的目标路由
     */
    const addTag = (route: RouteLocationNormalizedLoaded) => {
      if (!shouldRecordTag(route)) return;
      if (isHomeTag(route.path)) {
        ensureHomeTag();
        return;
      }

      const existing = tags.value.find((item) => item.path === route.path);
      if (existing) return;

      tags.value.push({
        path: route.path,
        title: route.meta.title as string,
        icon: route.meta.icon as string | undefined,
        affixed: route.meta.affix as boolean | undefined,
      });
      ensureHomeTag();
    };

    /**
     * 关闭标签后，若当前页正是被关闭的标签，则跳转到相邻标签或首页。
     * @param path 被关闭的标签路径
     */
    const navigateAfterRemove = (path: string) => {
      if (router.currentRoute.value.path !== path) return;

      const index = tags.value.findIndex((item) => item.path === path);
      const nextTag = tags.value[index] ?? tags.value[index - 1];
      router.push(nextTag?.path ?? HOME_PATH);
    };

    /**
     * 关闭指定标签。
     * 首页不可关闭，其余固定与非固定标签均可关闭。
     * @param path 目标标签路径
     */
    const removeTag = (path: string) => {
      if (isHomeTag(path)) return;

      const tag = tags.value.find((item) => item.path === path);
      if (!tag) return;

      tags.value = tags.value.filter((item) => item.path !== path);
      ensureHomeTag();
      navigateAfterRemove(path);
    };

    /**
     * 关闭指定标签左侧的所有非固定、非首页标签。
     * @param path 右键操作的目标标签路径
     */
    const closeLeft = (path: string) => {
      const index = tags.value.findIndex((item) => item.path === path);
      if (index <= 0) return;

      const removedPaths = new Set(
        tags.value
          .slice(0, index)
          .filter((item) => !isHomeTag(item.path) && !item.affixed)
          .map((item) => item.path),
      );
      if (!removedPaths.size) return;

      tags.value = tags.value.filter((item) => !removedPaths.has(item.path));
      ensureHomeTag();

      if (removedPaths.has(router.currentRoute.value.path)) {
        router.push(path);
      }
    };

    /**
     * 关闭指定标签右侧的所有非固定、非首页标签。
     * @param path 右键操作的目标标签路径
     */
    const closeRight = (path: string) => {
      const index = tags.value.findIndex((item) => item.path === path);
      if (index < 0 || index >= tags.value.length - 1) return;

      const removedPaths = new Set(
        tags.value
          .slice(index + 1)
          .filter((item) => !isHomeTag(item.path) && !item.affixed)
          .map((item) => item.path),
      );
      if (!removedPaths.size) return;

      tags.value = tags.value.filter((item) => !removedPaths.has(item.path));
      ensureHomeTag();

      if (removedPaths.has(router.currentRoute.value.path)) {
        router.push(path);
      }
    };

    /**
     * 关闭所有非固定、非首页标签，仅保留首页与 affixed 标签。
     */
    const closeAll = () => {
      const keptTags = tags.value.filter((item) => isHomeTag(item.path) || item.affixed);
      const removedPaths = new Set(
        tags.value.filter((item) => !isHomeTag(item.path) && !item.affixed).map((item) => item.path),
      );

      tags.value = keptTags;
      ensureHomeTag();

      if (removedPaths.has(router.currentRoute.value.path)) {
        router.push(keptTags[0]?.path ?? HOME_PATH);
      }
    };

    /**
     * 关闭当前右键选中的标签，等同于 removeTag。
     * @param path 目标标签路径
     */
    const closeCurrent = (path: string) => {
      removeTag(path);
    };

    /**
     * 切换标签的固定状态。
     * 首页不可取消固定。
     * @param path 目标标签路径
     */
    const toggleAffix = (path: string) => {
      if (isHomeTag(path)) return;

      const tag = tags.value.find((item) => item.path === path);
      if (!tag) return;
      tag.affixed = !tag.affixed;
      ensureHomeTag();
    };

    /**
     * 刷新指定标签对应的页面视图。
     * 通过递增 viewKeys 驱动 RouterView 重新挂载。
     * @param path 目标标签路径
     */
    const refreshTag = (path: string) => {
      viewKeys.value[path] = (viewKeys.value[path] ?? 0) + 1;
    };

    /**
     * 获取 RouterView 的 key，用于触发页面刷新。
     * @param path 当前路由路径
     */
    const getViewKey = (path: string) => `${path}-${viewKeys.value[path] ?? 0}`;

    /** 判断指定路径是否为当前激活标签 */
    const isActive = (path: string) => activePath.value === path;

    /**
     * 重置标签状态，退出登录时调用。
     * 恢复为仅含首页的初始状态，persist 插件会自动同步到 localStorage。
     */
    const reset = () => {
      tags.value = [{ ...HOME_TAG }];
      viewKeys.value = {};
    };

    return {
      tags,
      activePath,
      addTag,
      removeTag,
      closeLeft,
      closeRight,
      closeAll,
      closeCurrent,
      toggleAffix,
      refreshTag,
      getViewKey,
      isActive,
      reset,
    };
  },
  {
    persist: {
      key: STORE_KEY.MenuTagDataCache,
      pick: ["tags"],
      afterHydrate: (ctx) => {
        ctx.store.tags = normalizeTags(ctx.store.tags as MenuTagItem[]);
      },
    },
  },
);
