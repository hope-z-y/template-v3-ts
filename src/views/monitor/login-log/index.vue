<!-- 系统监控 -> 登录日志 -->

<template>
  <LoginLogPage />

  <!-- useModal 独立模式：详情内容就写在本页，footer: false 表示纯展示无确认按钮 -->
  <DetailModal>
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
  </DetailModal>
</template>

<script setup lang="ts">
import {
  CleanLoginLogs,
  DeleteLoginLog,
  GetLoginLogList,
} from "@/api/system-management/log-management/modules/login-log";
import type { ILoginLog, IQueryLoginLogParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import { NDescriptions, NDescriptionsItem } from "naive-ui";
import { computed } from "vue";
import { createColumns, loginStatusMap, searchSchema, type ILoginLogQuery } from "./data";

// 详情弹窗：独立模式（内容直接写在模板里），行数据通过 setData 传入
const [DetailModal, detailModalApi] = useModal<ILoginLog>({
  title: "登录日志详情",
  preset: "card",
  width: "560px",
  footer: false,
});

// getData 读取的是响应式状态，setData 后模板会自动更新
const detailRecord = computed(() => detailModalApi.getData() ?? null);

const [LoginLogPage] = usePage<ILoginLog, ILoginLogQuery, IQueryLoginLogParams>({
  title: "登录日志",
  columnStorageKey: "system:login-log:columns",

  api: {
    list: GetLoginLogList,
    delete: (row) => DeleteLoginLog(row.id),
  },

  search: {
    defaults: () => ({ username: undefined, status: undefined }),
    schema: searchSchema,
  },

  columns: createColumns({
    onDetail: (row) => detailModalApi.setData(row).open(),
  }),

  toolbar: [
    {
      label: "清空",
      icon: Delete24Regular,
      buttonType: "error",
      auth: "system:login-log:delete",
      confirm: () => "确定要清空全部登录日志吗？此操作不可恢复。",
      onConfirm: () => CleanLoginLogs(),
      successText: "清空成功",
    },
  ],
});
</script>

<style scoped></style>
