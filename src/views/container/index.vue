<template>
  <Layout>
    <template #title>
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <NIcon :size="24">
          <TextContinuous24Regular
            class="transition-transform duration-300"
            :class="{
              'rotate-0 ': collapse,
              '-rotate-180': !collapse,
            }"
            @click="toggleCollapse"
          />
        </NIcon>

        <Breadcrumbs class="" />
      </div>
    </template>
    <template #user>
      <div class="inline-flex gap-4 items-center shrink-0">
        <Search :items="menuSearchItems" />
        <NTooltip trigger="hover">
          <template #trigger>
            <NIcon
              :size="24"
              :component="isFullscreen ? FullScreenMinimize24Regular : FullScreenMaximize24Regular"
              @click="toggle"
            />
          </template>
          {{ isFullscreen ? "退出全屏" : "全屏" }}
        </NTooltip>
        <NTooltip trigger="hover">
          <template #trigger>
            <NIcon
              :size="24"
              :component="theme === 'dark' ? WeatherSunny24Regular : WeatherMoon24Regular"
              @click="toggleTheme"
            />
          </template>
          {{ theme === "dark" ? "浅色模式" : "深色模式" }}
        </NTooltip>
        <NPopover v-model:show="userPopoverVisible" trigger="hover" placement="bottom-end">
          <template #trigger>
            <NAvatar
              round
              class="cursor-pointer shrink-0"
              :style="{
                color: 'yellow',
                backgroundColor: 'red',
              }"
            >
              {{ userInfo?.username || userInfo?.account || "未命名" }}
            </NAvatar>
          </template>
          <UserAction />
        </NPopover>
      </div>
    </template>
    <template #menuTag>
      <MenuTag />
    </template>
    <template #menu>
      <Menu />
    </template>
    <div ref="routeViewRef" class="size-full min-h-0">
      <RouterView v-slot="{ Component, route: viewRoute }">
        <KeepAlive>
          <component :is="Component" v-if="viewRoute.meta.keepAlive" :key="viewKey" />
        </KeepAlive>
        <component :is="Component" v-if="!viewRoute.meta.keepAlive" :key="viewKey" />
      </RouterView>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { Layout } from "@/components";
import { useGlobalConfig } from "@/hooks";
import { useMenuStore, useUserStore } from "@/stores";
import { useMenuTagStore } from "@/stores/menu-tag";
import type { RouteMenuOption } from "@/utils";
import FullScreenMaximize24Regular from "@vicons/fluent/es/FullScreenMaximize24Regular";
import FullScreenMinimize24Regular from "@vicons/fluent/es/FullScreenMinimize24Regular";
import TextContinuous24Regular from "@vicons/fluent/es/TextContinuous24Regular";
import WeatherMoon24Regular from "@vicons/fluent/es/WeatherMoon24Regular";
import WeatherSunny24Regular from "@vicons/fluent/es/WeatherSunny24Regular";
import { useFullscreen } from "@vueuse/core";
import { NAvatar, NIcon, NPopover, NTooltip } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Breadcrumbs from "./modules/breadcrumb.vue";
import Menu from "./modules/menu.vue";
import MenuTag from "./modules/menu-tag.vue";
import Search from "./modules/search.vue";
import UserAction from "./modules/user-action.vue";

interface MenuSearchItem {
  id: string;
  label: string;
  path?: string;
  keywords?: string[];
}

const route = useRoute();
const menuTagStore = useMenuTagStore();
const viewKey = computed(() => menuTagStore.getViewKey(route.path));
const routeViewRef = ref<HTMLElement | null>(null);
let routeViewAnimation: Animation | null = null;

/** 仅让主内容区轻柔入场，保留 KeepAlive 实例，不影响侧栏和顶部导航。 */
watch(
  () => route.path,
  async (path, previousPath) => {
    if (!previousPath || path === previousPath) return;

    await nextTick();

    const element = routeViewRef.value;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!element?.animate || reduceMotion) return;

    routeViewAnimation?.cancel();
    routeViewAnimation = element.animate(
      [
        { opacity: 0.55, transform: "translateY(8px) scale(0.995)", filter: "blur(2px)" },
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  },
);

onBeforeUnmount(() => routeViewAnimation?.cancel());
const menuStore = useMenuStore();
const { menus } = storeToRefs(menuStore);

const { userInfo } = storeToRefs(useUserStore());
const { theme, toggleTheme, collapse, toggleCollapse } = useGlobalConfig();
const { isFullscreen, toggle } = useFullscreen();

const userPopoverVisible = ref(false);

const flattenMenuSearchItems = (items: RouteMenuOption[], parents: string[] = []): MenuSearchItem[] => {
  return items.flatMap((item) => {
    const label = item.label;
    const nextParents = [...parents, label];
    const current =
      item.navigable && !item.href
        ? [
            {
              id: item.key,
              label: nextParents.join(" / "),
              path: item.key,
              keywords: [label, item.key, item.permission ?? ""].filter(Boolean),
            },
          ]
        : [];

    return [...current, ...flattenMenuSearchItems(item.children ?? [], nextParents)];
  });
};

const menuSearchItems = computed(() => flattenMenuSearchItems(menus.value));
</script>

<style scoped></style>
