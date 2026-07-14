<!-- 系统管理 -> 部门管理（树形表：一次性加载全树 + 客户端过滤，无分页） -->

<template>
  <DeptPage />

  <DeptFormModal @success="pageApi.refresh" />
</template>

<script setup lang="ts">
import { DeleteDept, GetDeptTree } from "@/api/system-management";
import type { IDept } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { CreateColumns, FilterDeptTree, SearchSchema, type IDeptModalData, type IDeptQuery } from "./data";
import DeptForm from "./modules/form.vue";

const [DeptFormModal, formModalApi] = useModal<IDeptModalData>({ connectedComponent: DeptForm });

const [DeptPage, pageApi] = usePage<IDept, IDeptQuery>({
  title: "部门管理",
  columnStorageKey: "system:department:columns",

  api: {
    // 返回数组 = 全量模式：不分页，搜索走 clientFilter
    list: () => GetDeptTree(),
    delete: (row) => DeleteDept(row.id),
  },

  pagination: false,
  heightOffset: 20,

  search: {
    defaults: () => ({ deptName: undefined, status: undefined }),
    schema: SearchSchema,
    // 查询条件是响应式的：输入即过滤，无需重新请求
    clientFilter: FilterDeptTree,
  },

  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
  }),

  toolbar: [
    {
      label: "新增部门",
      icon: Add24Regular,
      auth: "system:department:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],

  // 树形展开等表格特性通过 table 透传给 NDataTable
  table: {
    scrollX: 1200,
    childrenKey: "children",
    defaultExpandAll: true,
    resizable: false,
  },
});
</script>

<style scoped></style>
