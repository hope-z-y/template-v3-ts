<!-- 系统监控 -> 操作日志 -->

<template>
  <Page v-model:column-options="columnOptions" title="操作日志" @refresh="getOperLogList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="模块标题" path="title">
          <NInput v-model:value="query.title" placeholder="请输入模块标题" clearable />
        </NFormItem>
        <NFormItem label="操作人员" path="operName">
          <NInput v-model:value="query.operName" placeholder="请输入操作人员" clearable />
        </NFormItem>
        <NFormItem label="操作状态" path="status">
          <NSelect
            v-model:value="query.status"
            :options="operStatusOptions"
            placeholder="请选择操作状态"
            clearable
            class="w-full min-w-[160px]"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <NButton type="error" @click="handleClean">
        <template #icon>
          <NIcon :component="Delete24Regular" />
        </template>
        清空
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

  <NDrawer v-model:show="detailVisible" :width="560" placement="right">
    <NDrawerContent title="操作日志详情" closable>
      <NDescriptions v-if="detailRecord" :column="1" label-placement="left">
        <NDescriptionsItem label="模块标题">{{ detailRecord.title || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="业务类型">{{ detailRecord.businessType ?? "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="请求方法">{{ detailRecord.requestMethod || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作人员">{{ detailRecord.operName || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="部门">{{ detailRecord.deptName || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="请求地址">{{ detailRecord.operUrl || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作 IP">{{ detailRecord.operIp || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作地点">{{ detailRecord.operLocation || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作状态">
          {{ operStatusMap[Number(detailRecord.status)]?.label ?? "未知" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="操作时间">{{ detailRecord.operTime }}</NDescriptionsItem>
        <NDescriptionsItem label="请求参数">
          <pre class="whitespace-pre-wrap break-all text-xs">{{ detailRecord.operParam || "-" }}</pre>
        </NDescriptionsItem>
        <NDescriptionsItem label="返回结果">
          <pre class="whitespace-pre-wrap break-all text-xs">{{ detailRecord.jsonResult || "-" }}</pre>
        </NDescriptionsItem>
        <NDescriptionsItem v-if="detailRecord.errorMsg" label="错误信息">
          <pre class="whitespace-pre-wrap break-all text-xs text-red-500">{{ detailRecord.errorMsg }}</pre>
        </NDescriptionsItem>
      </NDescriptions>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import {
  CleanOperLogs,
  DeleteOperLog,
  GetOperLogById,
  GetOperLogList,
} from "@/api/system-management/log-management/modules/operation-log";
import type { IOperLog, IQueryOperLogParams } from "@/api/types";
import { Page, SearchForm, type PageColumnOption } from "@/components";
import { Delete24Regular } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NFormItem,
  NIcon,
  NInput,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createOperLogColumns, operStatusMap, operStatusOptions } from "./data";

const message = useMessage();
const dialog = useDialog();

interface OperLogQuery {
  title?: string;
  operName?: string;
  status?: number;
}

const createDefaultQuery = (): OperLogQuery => ({
  title: undefined,
  operName: undefined,
  status: undefined,
});

const query = reactive<OperLogQuery>(createDefaultQuery());
const loading = ref(false);
const tableData = ref<IOperLog[]>([]);
const detailVisible = ref(false);
const detailRecord = ref<IOperLog | null>(null);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getOperLogList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getOperLogList();
  },
});

const buildQueryParams = (): IQueryOperLogParams => {
  const params: IQueryOperLogParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const title = query.title?.trim();
  const operName = query.operName?.trim();

  if (title) params.title = title;
  if (operName) params.operName = operName;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

const getOperLogList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetOperLogList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getOperLogList();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getOperLogList();
};

const handleDelete = (row: IOperLog) => {
  dialog.warning({
    title: "确认删除",
    content: "确定要删除该操作日志吗？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteOperLog(row.id);
        message.success("删除成功");
        await getOperLogList();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

const handleDetail = async (row: IOperLog) => {
  try {
    detailRecord.value = await GetOperLogById(row.id);
    detailVisible.value = true;
  } catch {
    detailRecord.value = row;
    detailVisible.value = true;
  }
};

const handleClean = () => {
  dialog.error({
    title: "确认清空",
    content: "确定要清空全部操作日志吗？此操作不可恢复。",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await CleanOperLogs();
        message.success("清空成功");
        pagination.page = 1;
        await getOperLogList();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "title", title: "模块标题", visible: true },
  { key: "operName", title: "操作人员", visible: true },
  { key: "deptName", title: "部门", visible: true },
  { key: "operUrl", title: "请求地址", visible: true },
  { key: "operIp", title: "操作 IP", visible: true },
  { key: "status", title: "操作状态", visible: true },
  { key: "operTime", title: "操作时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IOperLog>>(() => {
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
    ...createOperLogColumns({
      onDelete: handleDelete,
      onDetail: handleDetail,
    }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key))),
  ];
});

onMounted(() => {
  getOperLogList();
});
</script>

<style scoped></style>
