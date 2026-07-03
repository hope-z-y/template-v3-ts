<!-- 系统管理 -> 用户管理 -->

<template>
  <Page title="用户管理">
    <template #search> </template>

    <template #toolbar>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon :component="Add24Regular" />
        </template>
        新增
      </NButton>
      <NButton type="error" disabled @click="handleMultiDelete">
        <template #icon>
          <NIcon :component="Delete24Regular" />
        </template>
        批量删除
      </NButton>
      <NButton type="primary" @click="handleImport">
        <template #icon>
          <NIcon :component="ArrowUpload24Regular" />
        </template>
        导入
      </NButton>
      <NButton type="primary" @click="handleExport">
        <template #icon>
          <NIcon :component="ArrowDownload24Regular" />
        </template>
        导出
      </NButton>
    </template>

    <NDataTable
      :columns="
        createUserColumns({
          onEdit: handleEdit,
          onDelete: handleDelete,
          onResetPassword: handleResetPassword,
        })
      "
      :pagination="pagination"
      :data="tableData"
      :loading="loading"
      :scroll-x="1200"
      :flex-height="true"
      :row-key="(row) => row.id"
      remote
    />
  </Page>
</template>

<script setup lang="ts">
import { Page } from "@/components";
import { NButton, NDataTable, NIcon } from "naive-ui";
import { createUserColumns, type IUserRow } from "./data";
import { reactive, ref } from "vue";
import { GetUserList } from "@/api/system-management";
import { Add24Regular, ArrowDownload24Regular, Delete24Regular, ArrowUpload24Regular } from "@vicons/fluent";

// #region 获取用户列表
const loading = ref<boolean>(false);
const tableData = ref<IUserRow[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  total: 0,
  onChange: (page: number) => {
    pagination.page = page;
    getUserList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getUserList();
  },
});
const getUserList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetUserList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
    });
    tableData.value = rows;
    pagination.total = total;
  } finally {
    loading.value = false;
  }
};
getUserList();
// #endregion

const handleCreate = () => {};

const handleEdit = (row: IUserRow) => {};

const handleDelete = (row: IUserRow) => {};

const handleResetPassword = (row: IUserRow) => {};

const handleExport = () => {};

const handleImport = () => {};

const handleMultiDelete = () => {};
</script>

<style scoped></style>
