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
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon :component="Add24Regular" />
        </template>
        新增
      </NButton>
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
import { Page, SearchForm, type PageColumnOption } from "@/components";
import { Add24Regular } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NFormItem,
  NIcon,
  NInput,
  useDialog,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createConfigColumns, type IConfigRow } from "./data";
import ConfigForm from "./modules/form.vue";

const message = useMessage();
const dialog = useDialog();

interface ConfigQuery {
  configName?: string;
  configKey?: string;
}

const createDefaultQuery = (): ConfigQuery => ({
  configName: undefined,
  configKey: undefined,
});

const query = reactive<ConfigQuery>(createDefaultQuery());
const loading = ref(false);
const tableData = ref<IConfigRow[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getConfigList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getConfigList();
  },
});

const buildQueryParams = (): IQueryConfigParams => {
  const params: IQueryConfigParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const configName = query.configName?.trim();
  const configKey = query.configKey?.trim();

  if (configName) params.configName = configName;
  if (configKey) params.configKey = configKey;

  return params;
};

const getConfigList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetConfigList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getConfigList();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getConfigList();
};

const formVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRecord = ref<IConfigRow | null>(null);

const handleCreate = () => {
  formMode.value = "create";
  editingRecord.value = null;
  formVisible.value = true;
};

const handleEdit = (row: IConfigRow) => {
  formMode.value = "edit";
  editingRecord.value = row;
  formVisible.value = true;
};

const handleDelete = (row: IConfigRow) => {
  if (Number(row.configType) === 1) {
    message.warning("内置参数不允许删除");
    return;
  }

  dialog.error({
    title: "确认删除",
    content: `确定要删除参数「${row.configName}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteConfig(row.id);
        message.success("删除成功");
        await getConfigList();
      } catch {
        // 错误提示由响应拦截器统一处理
      }
    },
  });
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "configName", title: "参数名称", visible: true },
  { key: "configKey", title: "参数键名", visible: true },
  { key: "configValue", title: "参数键值", visible: true },
  { key: "configType", title: "系统内置", visible: true },
  { key: "createdAt", title: "创建时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IConfigRow>>(() => {
  const visibleKeys = new Set(
    columnOptions.value.filter((item) => item.visible).map((item) => item.key),
  );

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
    }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key))),
  ];
});

onMounted(() => {
  getConfigList();
});
</script>

<style scoped></style>
