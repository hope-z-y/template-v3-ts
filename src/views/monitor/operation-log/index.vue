<!-- 系统监控 -> 操作日志 -->

<template>
  <OperLogPage />

  <!-- 详情用抽屉展示（useModal 只封装 NModal，抽屉保持手写） -->
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
import { usePage } from "@/hooks";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import { NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent } from "naive-ui";
import { ref } from "vue";
import { createColumns, operStatusMap, searchSchema, type IOperLogQuery } from "./data";

const detailVisible = ref(false);
const detailRecord = ref<IOperLog | null>(null);

/** 详情优先拉完整数据（含请求参数 / 返回结果等大字段），失败降级用行数据 */
const handleDetail = async (row: IOperLog) => {
  try {
    detailRecord.value = await GetOperLogById(row.id);
  } catch {
    detailRecord.value = row;
  }
  detailVisible.value = true;
};

const [OperLogPage] = usePage<IOperLog, IOperLogQuery, IQueryOperLogParams>({
  title: "操作日志",
  columnStorageKey: "system:operation-log:columns",

  api: {
    list: GetOperLogList,
    delete: (row) => DeleteOperLog(row.id),
  },

  search: {
    defaults: () => ({ module: undefined, username: undefined, status: undefined }),
    schema: searchSchema,
  },

  columns: createColumns({ onDetail: handleDetail }),

  toolbar: [
    {
      label: "清空",
      icon: Delete24Regular,
      buttonType: "error",
      auth: "system:operation-log:delete",
      confirm: () => "确定要清空全部操作日志吗？此操作不可恢复。",
      onConfirm: () => CleanOperLogs(),
      successText: "清空成功",
    },
  ],
});
</script>

<style scoped></style>
