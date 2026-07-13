<!-- 系统管理 -> 参数设置 -->

<template>
  <Page v-model:column-options="columnOptions" title="参数设置" @refresh="getConfigList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="参数名称" path="paramName">
          <NInput v-model:value="query.paramName" placeholder="请输入参数名称" clearable />
        </NFormItem>
        <NFormItem label="参数键名" path="paramKey">
          <NInput v-model:value="query.paramKey" placeholder="请输入参数键名" clearable />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <Permission value="system:parameter:create">
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

  <ConfigForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getConfigList" />
</template>

<script setup lang="ts">
import { DeleteConfig, GetConfigList } from "@/api/system-management";
import type { IQueryConfigParams } from "@/api/types";
import { Page, Permission, SearchForm } from "@/components";
import { useColumnVisibility, useCrudDialog, useDeleteConfirm, useTableQuery } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { NButton, NDataTable, NFormItem, NIcon, NInput, useMessage, type DataTableColumns } from "naive-ui";
import { computed, onMounted, reactive } from "vue";
import { createConfigColumns, type IConfigRow } from "./data";
import ConfigForm from "./modules/form.vue";

const message = useMessage();
const { confirmDelete } = useDeleteConfirm();

type ConfigQuery = Pick<IQueryConfigParams, "paramName" | "paramKey">;

const createDefaultQuery = (): ConfigQuery => ({
  paramName: undefined,
  paramKey: undefined,
});

const query = reactive<ConfigQuery>(createDefaultQuery());

const buildQueryParams = (page: number, pageSize: number): IQueryConfigParams => {
  const params: IQueryConfigParams = {
    pageNum: page,
    pageSize,
  };

  const paramName = query.paramName?.trim();
  const paramKey = query.paramKey?.trim();

  if (paramName) params.paramName = paramName;
  if (paramKey) params.paramKey = paramKey;

  return params;
};

// 标准 CRUD 列表：分页、loading、搜索回到第一页都由 useTableQuery 管理。
const {
  loading,
  tableData,
  pagination,
  refresh: getConfigList,
  search,
} = useTableQuery<IConfigRow, IQueryConfigParams>({
  fetcher: GetConfigList,
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
} = useCrudDialog<IConfigRow>();

const handleDelete = (row: IConfigRow) => {
  if (row.paramType === "system") {
    message.warning("内置参数不允许删除");
    return;
  }

  confirmDelete({
    content: `确定要删除参数「${row.paramName}」吗？`,
    onDelete: async () => {
      await DeleteConfig(row.id);
    },
    onSuccess: getConfigList,
  });
};

const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "paramName", title: "参数名称", visible: true },
    { key: "paramKey", title: "参数键名", visible: true },
    { key: "paramValue", title: "参数键值", visible: true },
    { key: "paramType", title: "参数类型", visible: true },
    { key: "createdAt", title: "创建时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:parameter:columns",
);

const columns = computed<DataTableColumns<IConfigRow>>(() => {
  return [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createConfigColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});

onMounted(() => {
  getConfigList();
});
</script>

<style scoped></style>
