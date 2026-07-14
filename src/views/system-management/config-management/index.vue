<!-- 系统管理 -> 参数设置 -->

<template>
  <ConfigPage />

  <ConfigFormModal @success="pageApi.refresh" />
</template>

<script setup lang="ts">
import { DeleteConfig, GetConfigList } from "@/api/system-management";
import type { IQueryConfigParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { useMessage } from "naive-ui";
import { CreateColumns, SearchSchema, type IConfigModalData, type IConfigQuery, type IConfigRow } from "./data";
import ConfigForm from "./modules/form.vue";

const message = useMessage();

const [ConfigFormModal, formModalApi] = useModal<IConfigModalData>({ connectedComponent: ConfigForm });

const [ConfigPage, pageApi] = usePage<IConfigRow, IConfigQuery, IQueryConfigParams>({
  title: "参数设置",
  columnStorageKey: "system:parameter:columns",

  api: {
    list: GetConfigList,
    delete: (row) => DeleteConfig(row.id),
  },

  search: {
    defaults: () => ({ paramName: undefined, paramKey: undefined }),
    schema: SearchSchema,
  },

  // 列定义在 data.ts 中维护；useMessage 只能在 setup 里调用，提示逻辑作为回调注入
  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
    onDeleteBlocked: (reason) => message.warning(reason),
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:parameter:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],
});
</script>

<style scoped></style>
