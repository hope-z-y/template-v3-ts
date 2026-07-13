<!-- 系统监控 -> 操作日志 -->

<template>
  <Page v-model:column-options="columnOptions" title="操作日志" @refresh="getOperLogList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="业务模块" path="module">
          <NInput v-model:value="query.module" placeholder="请输入业务模块" clearable />
        </NFormItem>
        <NFormItem label="操作人员" path="username">
          <NInput v-model:value="query.username" placeholder="请输入操作人员" clearable />
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
      <Permission value="system:operation-log:delete">
        <NButton type="error" @click="handleClean">
          <template #icon>
            <NIcon :component="Delete24Regular" />
          </template>
          清空
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

  <NDrawer v-model:show="detailVisible" :width="560" placement="right">
    <NDrawerContent title="操作日志详情" closable>
      <NDescriptions v-if="detailRecord" :column="1" label-placement="left">
        <NDescriptionsItem label="业务模块">{{ detailRecord.module }}</NDescriptionsItem>
        <NDescriptionsItem label="操作类型">{{ detailRecord.operationType }}</NDescriptionsItem>
        <NDescriptionsItem label="请求方法">{{ detailRecord.requestMethod || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作人员">{{ detailRecord.username || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="请求地址">{{ detailRecord.requestUrl || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作 IP">{{ detailRecord.requestIp || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作地点">{{ detailRecord.requestLocation || "-" }}</NDescriptionsItem>
        <NDescriptionsItem label="操作状态">
          {{ operStatusMap[detailRecord.status]?.label ?? "未知" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="操作时间">{{ detailRecord.operatedAt }}</NDescriptionsItem>
        <NDescriptionsItem label="请求参数">
          <pre class="whitespace-pre-wrap break-all text-xs">{{ detailRecord.requestParams || "-" }}</pre>
        </NDescriptionsItem>
        <NDescriptionsItem label="返回结果">
          <pre class="whitespace-pre-wrap break-all text-xs">{{ detailRecord.responseResult || "-" }}</pre>
        </NDescriptionsItem>
        <NDescriptionsItem v-if="detailRecord.errorMessage" label="错误信息">
          <pre class="whitespace-pre-wrap break-all text-xs text-red-500">{{ detailRecord.errorMessage }}</pre>
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
import { Page, Permission, SearchForm } from "@/components";
import { useColumnVisibility, useDeleteConfirm, useTableQuery } from "@/hooks";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
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
const { confirmDelete } = useDeleteConfirm();

type OperLogQuery = Pick<IQueryOperLogParams, "module" | "username" | "status">;

const createDefaultQuery = (): OperLogQuery => ({
  module: undefined,
  username: undefined,
  status: undefined,
});

const query = reactive<OperLogQuery>(createDefaultQuery());
const detailVisible = ref(false);
const detailRecord = ref<IOperLog | null>(null);

const buildQueryParams = (page: number, pageSize: number): IQueryOperLogParams => {
  const params: IQueryOperLogParams = {
    pageNum: page,
    pageSize,
  };

  const module = query.module?.trim();
  const username = query.username?.trim();

  if (module) params.module = module;
  if (username) params.username = username;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

// 远程分页、loading 和页码切换统一交给 useTableQuery，页面只保留业务查询条件。
const {
  loading,
  tableData,
  pagination,
  refresh: getOperLogList,
  search,
} = useTableQuery<IOperLog, IQueryOperLogParams>({
  fetcher: GetOperLogList,
  buildParams: buildQueryParams,
});

const handleSearch = () => {
  return search();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  return search();
};

const handleDelete = (row: IOperLog) => {
  confirmDelete({
    content: "确定要删除该操作日志吗？",
    onDelete: async () => {
      await DeleteOperLog(row.id);
    },
    onSuccess: getOperLogList,
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

// 列显隐持久化到本地，刷新页面后仍保留用户上次选择。
const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "module", title: "业务模块", visible: true },
    { key: "username", title: "操作人员", visible: true },
    { key: "requestUrl", title: "请求地址", visible: true },
    { key: "requestIp", title: "操作 IP", visible: true },
    { key: "status", title: "操作状态", visible: true },
    { key: "operatedAt", title: "操作时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:operation-log:columns",
);

const columns = computed<DataTableColumns<IOperLog>>(() => {
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
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});

onMounted(() => {
  getOperLogList();
});
</script>

<style scoped></style>
