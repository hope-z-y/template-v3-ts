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
        <Search />
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
        <NTooltip trigger="hover">
          <template #trigger>
            <NIcon :size="24" :component="Alert24Regular" />
          </template>
          消息通知
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
    <div class="size-full min-h-0">
      <RouterView :key="viewKey" />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { Layout } from "@/components";
import { useGlobalConfig } from "@/hooks";
import { NIcon, NAvatar, NTooltip, NPopover } from "naive-ui";
import {
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular,
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Alert24Regular,
  TextContinuous24Regular,
} from "@vicons/fluent";
import { useFullscreen } from "@vueuse/core";
import Search from "./modules/search.vue";
import MenuTag from "./modules/menu-tag.vue";
import Breadcrumbs from "./modules/breadcrumb.vue";
import { useUserStore } from "@/stores";
import UserAction from "./modules/user-action.vue";
import Menu from "./modules/menu.vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useMenuTagStore } from "@/stores/menu-tag";
import { storeToRefs } from "pinia";

const route = useRoute();
const menuTagStore = useMenuTagStore();
const viewKey = computed(() => menuTagStore.getViewKey(route.path));

const { userInfo } = storeToRefs(useUserStore());
const { theme, toggleTheme, collapse, toggleCollapse } = useGlobalConfig();
const { isFullscreen, toggle } = useFullscreen();

const userPopoverVisible = ref(false);
</script>

<style scoped></style>
