<!-- 系统管理 -> 岗位管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="岗位管理" @refresh="getPostList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="岗位名称" path="postName">
          <NInput v-model:value="query.postName" placeholder="请输入岗位名称" clearable />
        </NFormItem>
        <NFormItem label="岗位编码" path="postCode">
          <NInput v-model:value="query.postCode" placeholder="请输入岗位编码" clearable />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="query.status"
            :options="statusOptions"
            placeholder="请选择状态"
            clearable
            class="w-full min-w-[160px]"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <Permission value="system:post:create">
        <NButton type="primary" @click="handleCreate">
          <template #icon>
            <NIcon :component="Add24Regular" />
          </template>
          新增
        </NButton>
      </Permission>
    </template>

    <template #default="maxHeight">
      <NDataTable
        :columns="columns"
        :bottom-bordered="false"
        :pagination="pagination"
        :data="tableData"
        :loading="loading"
        :row-key="(row) => row.id"
        scroll-x="fit-content"
        remote
        :max-height="maxHeight - 100"
        striped
        resizable
      />
    </template>
  </Page>

  <PostForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getPostList" />
</template>

<script setup lang="ts">
import { DeletePost, GetPostList } from "@/api/system-management";
import type { CommonStatus, IQueryPostParams } from "@/api/types";
import { Page, Permission, SearchForm } from "@/components";
import { useColumnVisibility, useCrudDialog, useDeleteConfirm, useTableQuery } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { NButton, NDataTable, NFormItem, NIcon, NInput, NSelect, type DataTableColumns } from "naive-ui";
import { computed, onMounted, reactive } from "vue";
import { createPostColumns, statusOptions, type IPostRow } from "./data";
import PostForm from "./modules/form.vue";

const { confirmDelete } = useDeleteConfirm();

interface PostQuery {
  postName?: string;
  postCode?: string;
  status?: CommonStatus;
}

const createDefaultQuery = (): PostQuery => ({
  postName: undefined,
  postCode: undefined,
  status: undefined,
});

const query = reactive<PostQuery>(createDefaultQuery());

const buildQueryParams = (page: number, pageSize: number): IQueryPostParams => {
  const params: IQueryPostParams = {
    pageNum: page,
    pageSize,
  };

  const postName = query.postName?.trim();
  const postCode = query.postCode?.trim();

  if (postName) params.postName = postName;
  if (postCode) params.postCode = postCode;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

// 标准 CRUD 列表：分页、loading、搜索回到第一页都由 useTableQuery 管理。
const {
  loading,
  tableData,
  pagination,
  refresh: getPostList,
  search,
} = useTableQuery<IPostRow, IQueryPostParams>({
  fetcher: GetPostList,
  buildParams: buildQueryParams,
});

const handleSearch = () => {
  return search();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  return search();
};

const {
  visible: formVisible,
  mode: formMode,
  record: editingRecord,
  openCreate: handleCreate,
  openEdit: handleEdit,
} = useCrudDialog<IPostRow>();

const handleDelete = (row: IPostRow) => {
  confirmDelete({
    content: `确定要删除岗位「${row.postName}」吗？`,
    onDelete: async () => {
      await DeletePost(row.id);
    },
    onSuccess: getPostList,
  });
};

const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "postCode", title: "岗位编码", visible: true },
    { key: "postName", title: "岗位名称", visible: true },
    { key: "postSort", title: "显示顺序", visible: true },
    { key: "status", title: "状态", visible: true },
    { key: "createdAt", title: "创建时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:post:columns",
);

const columns = computed<DataTableColumns<IPostRow>>(() => {
  return [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createPostColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});

onMounted(() => {
  getPostList();
});
</script>

<style scoped></style>
