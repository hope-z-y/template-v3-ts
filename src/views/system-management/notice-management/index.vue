<template><NoticePage /><NoticeFormModal @success="pageApi.refresh" /><NoticeDetailModal /></template>
<script setup lang="ts">
import { DeleteNotice, GetNoticeList } from "@/api/system-management";
import type { IQueryNoticeParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import {
  CreateColumns,
  SearchSchema,
  type INoticeDetailData,
  type INoticeModalData,
  type INoticeQuery,
  type INoticeRow,
} from "./data";
import NoticeForm from "./modules/form.vue";
import NoticeDetail from "./modules/detail.vue";
const [NoticeFormModal, formModalApi] = useModal<INoticeModalData>({ connectedComponent: NoticeForm });
const [NoticeDetailModal, detailModalApi] = useModal<INoticeDetailData>({ connectedComponent: NoticeDetail });
const [NoticePage, pageApi] = usePage<INoticeRow, INoticeQuery, IQueryNoticeParams>({
  title: "通知公告",
  columnStorageKey: "system:notice:columns",
  api: { list: GetNoticeList, delete: (row) => DeleteNotice(row.id) },
  search: { defaults: () => ({ title: undefined, type: undefined, status: undefined }), schema: SearchSchema },
  columns: CreateColumns({
    onView: (record) => detailModalApi.setData({ record }).open(),
    onEdit: (record) => formModalApi.setData({ mode: "edit", record }).open(),
  }),
  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:notice:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],
});
</script>
