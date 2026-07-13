<template>
  <div class="grid grid-rows-[auto_1fr] h-full">
    <NGradientText type="success" class="m-0 shrink-0 text-xl font-bold! text-center py-2">
      {{ appName }}
    </NGradientText>
    <NMenu
      :options="menus"
      :value="activeKey"
      :collapse="collapse"
      :collapse-transition="false"
      :render-label="renderMenuLabel"
      :render-icon="renderMenuIcon"
      @update:value="handleMenuUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { useGlobalConfig } from "@/hooks";
import { useMenuStore } from "@/stores";
import { FindMenuOptionByKey, GetAntdIconComponent, type RouteMenuOption } from "@/utils";
import { NIcon, NMenu, NGradientText, type MenuOption } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";

const appName = import.meta.env.VITE_APP_NAME;

const { collapse } = useGlobalConfig();
const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const { menus: rawMenus } = storeToRefs(menuStore);
const menus = computed(() => rawMenus.value as MenuOption[]);

/** 当前激活菜单项，与路由 path 保持同步 */
const activeKey = computed(() => route.path);

/**
 * 菜单选中项变更时触发路由跳转。
 * 目录节点仅展开不跳转；外链在新标签页打开。
 */
const handleMenuUpdate = (key: string) => {
  const option = FindMenuOptionByKey(rawMenus.value, key);
  if (!option?.navigable) return;

  if ("href" in option && option.href) {
    const opened = window.open(String(option.href), "_blank", "noopener,noreferrer");
    if (opened) {
      opened.opener = null;
    }
    return;
  }

  if (key !== route.path) {
    router.push(key);
  }
};

/** 外链渲染为 <a>，其余直接展示文本 */
const renderMenuLabel = (option: MenuOption) => {
  if ("href" in option && option.href) {
    return h("a", { href: option.href, target: "_blank", rel: "noopener noreferrer" }, option.label as string);
  }
  return option.label as string;
};

/** 接口返回有效的 Ant Design 图标组件名时渲染菜单图标 */
const renderMenuIcon = (option: MenuOption) => {
  const icon = GetAntdIconComponent((option as RouteMenuOption).iconName);
  if (!icon) return null;
  return h(NIcon, { component: icon });
};
</script>

<style scoped></style>
