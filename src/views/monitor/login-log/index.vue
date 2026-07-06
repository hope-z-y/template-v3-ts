<!-- 系统监控 -> 登录日志 -->

<template>
  <Page v-model:column-options="columnOptions" title="登录日志" @refresh="getLoginLogList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="登录账号" path="account">
          <NInput v-model:value="query.account" placeholder="请输入登录账号" clearable />
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

  <NModal v-model:show="detailVisible" preset="card" style="width: 560px" title="登录日志详情">
    <NDescriptions v-if="detailRecord" :column="1" bordered label-placement="left">
      <NDescriptionsItem label="登录账号">{{ detailRecord.account }}</NDescriptionsItem>
      <NDescriptionsItem label="登录 IP">{{ detailRecord.ip || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录地点">{{ detailRecord.location || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="浏览器">{{ detailRecord.browser || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="操作系统">{{ detailRecord.os || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录状态">
        {{ loginStatusMap[Number(detailRecord.status)]?.label ?? "未知" }}
      </NDescriptionsItem>
      <NDescriptionsItem label="提示消息">{{ detailRecord.msg || "-" }}</NDescriptionsItem>
      <NDescriptionsItem label="登录时间">{{ detailRecord.loginTime }}</NDescriptionsItem>
    </NDescriptions>
  </NModal>
</template>

<script setup lang="ts">
import { CleanLoginLogs, DeleteLoginLog, GetLoginLogList } from "@/api/system-management/log-management/modules/login-log";
import type { ILoginLog, IQueryLoginLogParams } from "@/api/types";
import { Page, SearchForm, type PageColumnOption } from "@/components";
import { Delete24Regular } from "@vicons/fluent";
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

interface LoginLogQuery {
  account?: string;
  status?: number;
}

const createDefaultQuery = (): LoginLogQuery => ({
  account: undefined,
  status: undefined,
});

const query = reactive<LoginLogQuery>(createDefaultQuery());
const loading = ref(false);
const tableData = ref<ILoginLog[]>([]);
const detailVisible = ref(false);
const detailRecord = ref<ILoginLog | null>(null);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getLoginLogList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getLoginLogList();
  },
});

const buildQueryParams = (): IQueryLoginLogParams => {
  const params: IQueryLoginLogParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const account = query.account?.trim();
  if (account) params.account = account;
  if (query.status !== undefined && query.status !== null) params.status = query.status;

  return params;
};

const getLoginLogList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetLoginLogList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getLoginLogList();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getLoginLogList();
};

const handleDelete = (row: ILoginLog) => {
  dialog.warning({
    title: "确认删除",
    content: `确定要删除该登录日志吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteLoginLog(row.id);
        message.success("删除成功");
        await getLoginLogList();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
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

const columnOptions = ref<PageColumnOption[]>([
  { key: "account", title: "登录账号", visible: true },
  { key: "ip", title: "登录 IP", visible: true },
  { key: "location", title: "登录地点", visible: true },
  { key: "browser", title: "浏览器", visible: true },
  { key: "os", title: "操作系统", visible: true },
  { key: "status", title: "登录状态", visible: true },
  { key: "msg", title: "提示消息", visible: true },
  { key: "loginTime", title: "登录时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<ILoginLog>>(() => {
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
    ...createLoginLogColumns({
      onDelete: handleDelete,
      onDetail: handleDetail,
    }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key))),
  ];
});

onMounted(() => {
  getLoginLogList();
});
</script>

<style scoped></style>
