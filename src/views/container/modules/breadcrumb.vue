<template>
  <NBreadcrumb class="min-w-0 mt-1">
    <NBreadcrumbItem
      v-for="(item, index) in breadcrumbItems"
      :key="item.path"
      :clickable="index < breadcrumbItems.length - 1"
      @click="handleClick(item, index)"
    >
      {{ item.title }}
    </NBreadcrumbItem>
  </NBreadcrumb>
</template>

<script setup lang="ts">
import { NBreadcrumb, NBreadcrumbItem } from "naive-ui";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RouteRecordNormalized } from "vue-router";

interface BreadcrumbItem {
  title: string;
  path: string;
}

const route = useRoute();
const router = useRouter();

/**
 * 解析面包屑项的可导航路径。
 * 末级使用当前路由 path；中间层级优先取 redirect，否则按 matched 片段拼接。
 */
const resolveBreadcrumbPath = (
  record: RouteRecordNormalized,
  index: number,
  matched: RouteRecordNormalized[],
): string => {
  if (index === matched.length - 1) return route.path;

  const redirect = record.redirect;
  if (typeof redirect === "string") return redirect;

  const segments = matched
    .slice(0, index + 1)
    .map((item) => item.path.replace(/^\//, ""))
    .filter(Boolean);

  return `/${segments.join("/")}`;
};

/** 根据当前路由 matched 生成面包屑列表 */
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter((record) => record.meta?.title && record.meta?.breadcrumb !== false);

  return matched.map((record, index) => ({
    title: record.meta!.title as string,
    path: resolveBreadcrumbPath(record, index, matched),
  }));
});

const handleClick = (item: BreadcrumbItem, index: number) => {
  if (index >= breadcrumbItems.value.length - 1) return;
  if (item.path !== route.path) {
    router.push(item.path);
  }
};
</script>

<style scoped></style>
