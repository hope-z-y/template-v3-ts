<template>
    <Layout>
        <template #title>
            <div class="flex min-w-0 flex-1 items-center gap-4">
                <NIcon :size="24">
                    <TextContinuous24Regular @click="toggleCollapse" class="transition-transform duration-300" :class="{
                        'rotate-0 ': collapse,
                        '-rotate-180': !collapse,
                    }" />
                </NIcon>
                <!-- <h1 class="m-0 shrink-0 text-lg font-bold">中后台管理系统</h1> -->
                <NGradientText type="warning" class="m-0 shrink-0 text-xl font-bold!">
                    {{ appName }}
                </NGradientText>
                <Breadcrumbs class="mt-1.5" />
            </div>
        </template>
        <template #user>
            <div class=" inline-flex gap-4 items-center shrink-0">
                <Search />
                <NTooltip trigger="hover">
                    <template #trigger>
                        <NIcon :size="24" @click="toggle"
                            :component="isFullscreen ? FullScreenMinimize24Regular : FullScreenMaximize24Regular" />
                    </template>
                    {{ isFullscreen ? '退出全屏' : '全屏' }}
                </NTooltip>
                <NTooltip trigger="hover">
                    <template #trigger>
                        <NIcon :size="24" @click="toggleTheme"
                            :component="theme === 'dark' ? WeatherSunny24Regular : WeatherMoon24Regular" />
                    </template>
                    {{ theme === 'dark' ? '浅色模式' : '深色模式' }}
                </NTooltip>
                <NTooltip trigger="hover">
                    <template #trigger>
                        <NIcon :size="24" :component="Alert24Regular" />
                    </template>
                    消息通知
                </NTooltip>
                <NPopover trigger="hover" placement="bottom-end" v-model:show="userPopoverVisible">
                    <template #trigger>
                        <NAvatar round class="cursor-pointer shrink-0" :style="{
                            color: 'yellow',
                            backgroundColor: 'red',
                        }">
                            {{ userInfo.name || '未命名' }}
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
        <div class=" size-full">
            <RouterView :key="viewKey" />
        </div>
    </Layout>
</template>

<script setup lang="ts">
import { Layout } from "@/components";
import { useGlobalConfig } from "@/hooks";
import { NIcon, NAvatar, NTooltip, NPopover, NGradientText } from "naive-ui";
import { FullScreenMaximize24Regular, FullScreenMinimize24Regular, WeatherSunny24Regular, WeatherMoon24Regular, Alert24Regular, TextContinuous24Regular } from "@vicons/fluent"
import { useFullscreen } from "@vueuse/core"
import Search from "./modules/search.vue"
import MenuTag from "./modules/menu-tag.vue"
import Breadcrumbs from "./modules/breadcrumb.vue"
import { useUserStore } from "@/stores"
import UserAction from "./modules/user-action.vue"
import Menu from "./modules/menu.vue"
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useMenuTagStore } from "@/stores/menu-tag";

const appName = import.meta.env.VITE_APP_NAME

const route = useRoute();
const menuTagStore = useMenuTagStore();
const viewKey = computed(() => menuTagStore.getViewKey(route.path));

const { userInfo } = useUserStore()
const { theme, toggleTheme, collapse, toggleCollapse } = useGlobalConfig();
const { isFullscreen, toggle } = useFullscreen()

const userPopoverVisible = ref(false)

</script>

<style scoped></style>