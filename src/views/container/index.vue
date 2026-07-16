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
        <NotificationBell />
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
              :component="resolvedTheme === 'dark' ? WeatherSunny24Regular : WeatherMoon24Regular"
              @click="toggleTheme"
            />
          </template>
          {{ resolvedTheme === "dark" ? "浅色模式" : "深色模式" }}
        </NTooltip>
        <NPopover v-model:show="userPopoverVisible" trigger="hover" placement="bottom-end">
          <template #trigger>
            <button
              type="button"
              class="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent p-0 text-left"
            >
              <NAvatar round class="shrink-0" :src="userInfo?.avatar || UserAvatar">
                {{ (userInfo?.username || userInfo?.account || "?").slice(0, 1) }}
              </NAvatar>
              <span class="hidden max-w-44 truncate text-sm text-black/65 lg:block dark:text-white/70">
                {{ userInfo?.email || userInfo?.account || "未设置账号" }}
              </span>
            </button>
          </template>
          <UserAction @select="userPopoverVisible = false" />
        </NPopover>
      </div>
    </template>
    <template #menuTag>
      <MenuTag />
    </template>
    <template #menu>
      <Menu />
    </template>
    <div class="size-full min-h-0"><RouteView /></div>
  </Layout>
  <LockScreen />
</template>

<script setup lang="ts">
import { Layout } from "@/components";
import UserAvatar from "@/assets/images/Vue.png";
import { useGlobalConfig, useLockScreen } from "@/hooks";
import { useMenuStore, useUserStore } from "@/stores";
import type { RouteMenuOption } from "@/utils";
import FullScreenMaximize24Regular from "@vicons/fluent/es/FullScreenMaximize24Regular";
import FullScreenMinimize24Regular from "@vicons/fluent/es/FullScreenMinimize24Regular";
import TextContinuous24Regular from "@vicons/fluent/es/TextContinuous24Regular";
import WeatherMoon24Regular from "@vicons/fluent/es/WeatherMoon24Regular";
import WeatherSunny24Regular from "@vicons/fluent/es/WeatherSunny24Regular";
import { useFullscreen } from "@vueuse/core";
import { NAvatar, NIcon, NPopover, NTooltip } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import Breadcrumbs from "./modules/breadcrumb.vue";
import Menu from "./modules/menu.vue";
import MenuTag from "./modules/menu-tag.vue";
import LockScreen from "./modules/lock-screen.vue";
import RouteView from "./modules/route-view.vue";
import Search from "./modules/search.vue";
import UserAction from "./modules/user-action.vue";
import NotificationBell from "./modules/notification-bell.vue";

interface MenuSearchItem {
  id: string;
  label: string;
  path?: string;
  keywords?: string[];
}

const menuStore = useMenuStore();
const { menus } = storeToRefs(menuStore);

const { userInfo } = storeToRefs(useUserStore());
const { resolvedTheme, toggleTheme, collapse, toggleCollapse } = useGlobalConfig();
const { isFullscreen, toggle } = useFullscreen();
const { startAutoLock } = useLockScreen();
let stopAutoLock: (() => void) | undefined;
onMounted(() => (stopAutoLock = startAutoLock()));
onBeforeUnmount(() => stopAutoLock?.());

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
