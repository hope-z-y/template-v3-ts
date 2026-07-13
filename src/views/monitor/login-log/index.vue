<!-- 系统监控 -> 登录日志 -->

<template>
  <Page v-model:column-options="columnOptions" title="登录日志" @refresh="getLoginLogList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="登录用户" path="username">
          <NInput v-model:value="query.username" placeholder="请输入登录用户" clearable />
        </NFormItem>
        <NFormItem label="登录状态" path="status">
          <NSelect
            v-model:value="query.status"
            :options="loginStatusOptions"
            placeholder="请选择登录状态"
            clearable
            class="w-full min-w-[160px]"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <Permission value="system:login-log:delete">
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

  <NModal v-model:show="detailVisible" preset="card" style="width: 560px" title="登录日志详情">
    <NDescriptions v-if="detailRecord" :column="1" bordered label-placement="left">
      <NDescriptionsItem label="登录用户">{{ detailRecord.username || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录 IP">{{ detailRecord.loginIp || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录地点">{{ detailRecord.loginLocation || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="浏览器">{{ detailRecord.browser || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="操作系统">{{ detailRecord.os || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录状态">
        {{ loginStatusMap[detailRecord.status]?.label ?? "未知" }}
      </NDescriptionsItem>
      <NDescriptionsItem label="提示消息">{{ detailRecord.message || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录时间">{{ detailRecord.loginAt }}</NDescriptionsItem>
    </NDescriptions>
  </NModal>
</template>

<script setup lang="ts">
import {
  CleanLoginLogs,
  DeleteLoginLog,
  GetLoginLogList,
} from "@/api/system-management/log-management/modules/login-log";
import type { ILoginLog, IQueryLoginLogParams } from "@/api/types";
import { Page, Permission, SearchForm } from "@/components";
import { useColumnVisibility, useDeleteConfirm, useTableQuery } from "@/hooks";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import {
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createLoginLogColumns, loginStatusMap, loginStatusOptions } from "./data";

const message = useMessage();
const dialog = useDialog();
const { confirmDelete } = useDeleteConfirm();

type LoginLogQuery = Pick<IQueryLoginLogParams, "username" | "status">;

const createDefaultQuery = (): LoginLogQuery => ({
  username: undefined,
  status: undefined,
});

const query = reactive<LoginLogQuery>(createDefaultQuery());
const detailVisible = ref(false);
const detailRecord = ref<ILoginLog | null>(null);

const buildQueryParams = (page: number, pageSize: number): IQueryLoginLogParams => {
  const params: IQueryLoginLogParams = {
    pageNum: page,
    pageSize,
  };

  const username = query.username?.trim();
  if (username) params.username = username;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

// 远程分页、loading 和页码切换统一交给 useTableQuery，页面只保留业务查询条件。
const {
  loading,
  tableData,
  pagination,
  refresh: getLoginLogList,
  search,
} = useTableQuery<ILoginLog, IQueryLoginLogParams>({
  fetcher: GetLoginLogList,
  buildParams: buildQueryParams,
});

const handleSearch = () => {
  return search();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  return search();
};

const handleDelete = (row: ILoginLog) => {
  confirmDelete({
    content: `确定要删除该登录日志吗？`,
    onDelete: async () => {
      await DeleteLoginLog(row.id);
    },
    onSuccess: getLoginLogList,
  });
};

const handleDetail = (row: ILoginLog) => {
  detailRecord.value = row;
  detailVisible.value = true;
};

const handleClean = () => {
  dialog.error({
    title: "确认清空",
    content: "确定要清空全部登录日志吗？此操作不可恢复。",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await CleanLoginLogs();
        message.success("清空成功");
        pagination.page = 1;
        await getLoginLogList();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

// 列显隐持久化到本地，刷新页面后仍保留用户上次选择。
const { columnOptions, visibleKeys } = useColumnVisibility(
  [
    { key: "username", title: "登录用户", visible: true },
    { key: "loginIp", title: "登录 IP", visible: true },
    { key: "loginLocation", title: "登录地点", visible: true },
    { key: "browser", title: "浏览器", visible: true },
    { key: "os", title: "操作系统", visible: true },
    { key: "status", title: "登录状态", visible: true },
    { key: "message", title: "提示消息", visible: true },
    { key: "loginAt", title: "登录时间", visible: true },
    { key: "actions", title: "操作", visible: true, disabled: true },
  ],
  "system:login-log:columns",
);

const columns = computed<DataTableColumns<ILoginLog>>(() => {
  return [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createLoginLogColumns({
      onDelete: handleDelete,
      onDetail: handleDetail,
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});

onMounted(() => {
  getLoginLogList();
});
</script>

<style scoped></style>
