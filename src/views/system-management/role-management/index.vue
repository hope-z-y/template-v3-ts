<!-- 系统管理 -> 角色管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="角色管理" @refresh="getRoleList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="角色名称" path="roleName">
          <NInput v-model:value="query.roleName" placeholder="请输入角色名称" clearable />
        </NFormItem>
        <NFormItem label="角色编码" path="roleKey">
          <NInput v-model:value="query.roleKey" placeholder="请输入角色编码" clearable />
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
      <Permission value="system:role:create">
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

  <RoleForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getRoleList" />
</template>

<script setup lang="ts">
import { DeleteRole, GetRoleList } from "@/api/system-management";
import type { CommonStatus, IQueryRoleParams } from "@/api/types";
import { Page, Permission, SearchForm } from "@/components";
import { useColumnVisibility, useCrudDialog, useDeleteConfirm, useTableQuery } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { NButton, NDataTable, NFormItem, NIcon, NInput, NSelect, type DataTableColumns } from "naive-ui";
import { computed, onMounted, reactive } from "vue";
import { createRoleColumns, statusOptions, type IRoleRow } from "./data";
import RoleForm from "./modules/form.vue";

const { confirmDelete } = useDeleteConfirm();

interface RoleQuery {
  roleName?: string;
  roleKey?: string;
  status?: CommonStatus;
}

const createDefaultQuery = (): RoleQuery => ({
  roleName: undefined,
  roleKey: undefined,
  status: undefined,
});

const query = reactive<RoleQuery>(createDefaultQuery());

const buildQueryParams = (page: number, pageSize: number): IQueryRoleParams => {
  const params: IQueryRoleParams = {
    pageNum: page,
    pageSize,
  };

  const roleName = query.roleName?.trim();
  const roleKey = query.roleKey?.trim();

  if (roleName) params.roleName = roleName;
  if (roleKey) params.roleKey = roleKey;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

// 标准 CRUD 列表：分页、loading、搜索回到第一页都由 useTableQuery 管理。
const {
  loading,
  tableData,
  pagination,
  refresh: getRoleList,
  search,
} = useTableQuery<IRoleRow, IQueryRoleParams>({
  fetcher: GetRoleList,
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
} = useCrudDialog<IRoleRow>();

const handleDelete = (row: IRoleRow) => {
  confirmDelete({
    content: `确定要删除角色「${row.roleName}」吗？`,
    onDelete: async () => {
      await DeleteRole(row.id);
    },
    onSuccess: getRoleList,
  });
};

const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "roleName", title: "角色名称", visible: true },
    { key: "roleKey", title: "角色标识", visible: true },
    { key: "roleSort", title: "显示顺序", visible: true },
    { key: "dataScope", title: "数据权限", visible: true },
    { key: "status", title: "状态", visible: true },
    { key: "createdAt", title: "创建时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:role:columns",
);

const columns = computed<DataTableColumns<IRoleRow>>(() => {
  return [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createRoleColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});

onMounted(() => {
  getRoleList();
});
</script>

<style scoped></style>
