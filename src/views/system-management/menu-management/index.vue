<!-- 系统管理 -> 菜单管理（树形表：一次性加载全树 + 客户端过滤，无分页） -->

<template>
  <MenuPage />

  <MenuFormModal @success="pageApi.refresh" />
</template>

<script setup lang="ts">
import { DeleteMenu, GetMenuTree } from "@/api/system-management";
import type { IMenu } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import { useUserStore } from "@/stores";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { CreateColumns, FilterMenuTree, SearchSchema, type IMenuModalData, type IMenuQuery } from "./data";
import MenuForm from "./modules/form.vue";

const userStore = useUserStore();

const [MenuFormModal, formModalApi] = useModal<IMenuModalData>({ connectedComponent: MenuForm });

const [MenuPage, pageApi] = usePage<IMenu, IMenuQuery>({
  title: "菜单管理",
  columnStorageKey: "system:menu:columns",

  api: {
    list: () => GetMenuTree(),
    delete: (row) => DeleteMenu(row.id),
  },

  pagination: false,
  heightOffset: 50,

  search: {
    defaults: () => ({ menuName: undefined, status: undefined }),
    schema: SearchSchema,
    clientFilter: FilterMenuTree,
  },

  hooks: {
    // 管理端菜单修改后重新获取 Profile，让侧边栏和当前用户实际可见菜单保持一致
    afterFetch: () => userStore.loadProfile(true),
  },

  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
  }),

  toolbar: [
    {
      label: "新增菜单",
      icon: Add24Regular,
      auth: "system:menu:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],

  table: {
    scrollX: 1200,
    childrenKey: "children",
    defaultExpandAll: true,
    bordered: true,
    resizable: false,
  },
});
</script>

<style scoped>
:deep(.n-data-table-td) {
  vertical-align: middle;
}

:deep(.n-data-table-td .n-ellipsis) {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
</style>
