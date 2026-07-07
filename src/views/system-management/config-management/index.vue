<!-- 系统管理 -> 参数设置 -->

<template>
  <Page v-model:column-options="columnOptions" title="参数设置" @refresh="getConfigList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="参数名称" path="configName">
          <NInput v-model:value="query.configName" placeholder="请输入参数名称" clearable />
        </NFormItem>
        <NFormItem label="参数键名" path="configKey">
          <NInput v-model:value="query.configKey" placeholder="请输入参数键名" clearable />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <Permission value="system:config:add">
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

interface ConfigQuery {
  configName?: string;
  configKey?: string;
}

const createDefaultQuery = (): ConfigQuery => ({
  configName: undefined,
  configKey: undefined,
});

const query = reactive<ConfigQuery>(createDefaultQuery());

const buildQueryParams = (page: number, pageSize: number): IQueryConfigParams => {
  const params: IQueryConfigParams = {
    pageNum: page,
    pageSize,
  };

  const configName = query.configName?.trim();
  const configKey = query.configKey?.trim();

  if (configName) params.configName = configName;
  if (configKey) params.configKey = configKey;

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
  if (Number(row.configType) === 1) {
    message.warning("内置参数不允许删除");
    return;
  }

  confirmDelete({
    content: `确定要删除参数「${row.configName}」吗？`,
    onDelete: async () => {
      await DeleteConfig(row.id);
    },
    onSuccess: getConfigList,
  });
};

const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "configName", title: "参数名称", visible: true },
    { key: "configKey", title: "参数键名", visible: true },
    { key: "configValue", title: "参数键值", visible: true },
    { key: "configType", title: "系统内置", visible: true },
    { key: "createdAt", title: "创建时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:config:columns",
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
