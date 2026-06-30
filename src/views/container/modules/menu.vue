<template>
    <NMenu :options="menus" :value="activeKey" :collapse="collapse" :collapse-transition="false"
        :render-label="renderMenuLabel" :render-icon="renderMenuIcon" @update:value="handleMenuUpdate" />
</template>

<script setup lang="ts">
import { useGlobalConfig } from "@/hooks";
import { staticRoutes } from "@/router";
import * as FluentIcons from "@vicons/fluent";
import { Album24Regular } from "@vicons/fluent";
import { NIcon, NMenu, type MenuOption } from "naive-ui";
import type { RouteRecordRaw } from "vue-router";
import { computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";

const { collapse } = useGlobalConfig();
const route = useRoute();
const router = useRouter();

/**
 * 扩展 Naive UI 菜单项类型。
 * 使用 iconName 而非 icon，避免与 MenuOption 内置的 icon 渲染函数属性冲突。
 */
type RouteMenuOption = MenuOption & { iconName?: string };

/**
 * 将父子路由的 path 片段拼接为可用于导航的完整路径。
 * @param parentPath 父级已解析路径，如 `/system-management`
 * @param routePath 当前路由 path，可能是相对片段（`user-management`）或绝对路径（`/login`）
 * @returns 规范化后的完整路径，如 `/system-management/user-management`
 */
const resolveRoutePath = (parentPath: string, routePath: string): string => {
    if (routePath.startsWith("/")) return routePath;
    const base = parentPath.replace(/\/$/, "");
    return base ? `${base}/${routePath}` : `/${routePath}`;
};

/**
 * 将路由配置递归转换为 Naive UI 菜单选项。
 * - 自动跳过 meta.hidden 为 true 的路由
 * - 有子路由时生成嵌套 children，供侧边栏展示多级菜单
 * - label 优先取 meta.title，其次取路由 name / path
 * @param routes 待转换的路由列表
 * @param parentPath 父级完整路径，用于拼接嵌套路由
 */
const routesToMenuOptions = (
    routes: RouteRecordRaw[],
    parentPath = "",
): RouteMenuOption[] => {
    return routes
        .filter((item) => !item.meta?.hidden)
        .map((item) => {
            const fullPath = resolveRoutePath(parentPath, item.path);
            const children = item.children?.length
                ? routesToMenuOptions(item.children, fullPath)
                : undefined;

            const option: RouteMenuOption = {
                label: (item.meta?.title as string) || String(item.name ?? item.path),
                key: fullPath,
                iconName: item.meta?.icon as string | undefined,
            };

            if (children?.length) {
                option.children = children;
            }

            return option;
        });
};

/** 侧边栏菜单数据，来源于布局容器（staticRoutes[0]）下的子路由 */
const menus = computed(() => {
    const children = staticRoutes[0]?.children;
    if (!children) return [];
    return routesToMenuOptions(children);
});

/** 当前激活菜单项，与路由 path 保持同步以高亮选中项 */
const activeKey = computed(() => route.path);

/**
 * 菜单选中项变更时触发路由跳转。
 * 若目标路径与当前路径相同则忽略，避免重复导航。
 * @param key 菜单项 key，即完整路由路径
 */
const handleMenuUpdate = (key: string) => {
    if (key !== route.path) {
        router.push(key);
    }
};

/**
 * 自定义菜单标签渲染。
 * 外链项（含 href）渲染为 <a> 并在新标签页打开，其余直接展示文本。
 * @param option Naive UI 菜单项配置
 */
const renderMenuLabel = (option: MenuOption) => {
    if ("href" in option) {
        return h(
            "a",
            { href: option.href, target: "_blank" },
            option.label as string,
        );
    }
    return option.label as string;
};

/**
 * 根据路由 meta.icon 中的图标名称，从 @vicons/fluent 中解析对应组件。
 * 未配置或找不到时回退为 Album24Regular。
 * @param iconName Fluent 图标组件名称，如 `People24Regular`
 */
const getIconComponent = (iconName?: string) => {
    if (!iconName) return Album24Regular;
    return (
        (FluentIcons as Record<string, typeof Album24Regular>)[iconName] ??
        Album24Regular
    );
};

/**
 * 自定义菜单图标渲染。
 * 读取 routesToMenuOptions 写入的 iconName，并包装为 NIcon 节点。
 * @param option Naive UI 菜单项配置
 */
const renderMenuIcon = (option: MenuOption) => {
    const icon = getIconComponent((option as RouteMenuOption).iconName);
    return h(NIcon, null, { default: () => h(icon) });
};
</script>

<style scoped></style>
