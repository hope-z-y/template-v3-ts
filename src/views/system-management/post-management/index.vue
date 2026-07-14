<!-- 系统管理 -> 岗位管理 -->

<template>
  <PostPage />

  <!-- useModal 连接模式：attrs / 事件透传给 form.vue，@success 时刷新列表 -->
  <PostFormModal @success="pageApi.refresh" />
</template>

<script setup lang="ts">
import { DeletePost, GetPostList } from "@/api/system-management";
import type { IQueryPostParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { CreateColumns, SearchSchema, type IPostModalData, type IPostQuery, type IPostRow } from "./data";
import PostForm from "./modules/form.vue";

// 新增 / 编辑弹窗：连接 form.vue，通过 formModalApi 命令式打开并传数据
const [PostFormModal, formModalApi] = useModal<IPostModalData>({ connectedComponent: PostForm });

const [PostPage, pageApi] = usePage<IPostRow, IPostQuery, IQueryPostParams>({
  title: "岗位管理",
  columnStorageKey: "system:post:columns",

  api: {
    list: GetPostList,
    // 操作列的"删除"确认后默认调用它，成功后自动刷新
    delete: (row) => DeletePost(row.id),
  },

  search: {
    // defaults 必须枚举全部字段，"重置"才能逐字段还原
    defaults: () => ({ postName: undefined, postCode: undefined, status: undefined }),
    schema: SearchSchema,
  },

  // 列定义在 data.ts 中维护，页面回调通过工厂参数注入
  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:post:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],
});
</script>

<style scoped></style>
