import type { INotice, IQueryNoticeParams, NoticeStatus, NoticeTargetType, NoticeType } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Eye24Regular from "@vicons/fluent/es/Eye24Regular";
import Megaphone24Regular from "@vicons/fluent/es/Megaphone24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

export type INoticeRow = INotice;
export type INoticeQuery = Pick<IQueryNoticeParams, "title" | "type" | "status">;
export interface INoticeModalData {
  mode: "create" | "edit";
  record: INoticeRow | null;
}
export interface INoticeDetailData {
  record: INoticeRow;
}
export const NoticeTypeOptions: Array<{ label: string; value: NoticeType }> = [
  { label: "通知", value: "notice" },
  { label: "公告", value: "announcement" },
];
export const NoticeStatusOptions: Array<{ label: string; value: NoticeStatus }> = [
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已关闭", value: "closed" },
];
export const NoticeTargetTypeOptions: Array<{ label: string; value: NoticeTargetType }> = [
  { label: "全体用户", value: "all" },
  { label: "指定部门", value: "department" },
  { label: "指定角色", value: "role" },
  { label: "指定用户", value: "user" },
];
const statusMeta: Record<NoticeStatus, { label: string; type: "default" | "success" | "warning" }> = {
  draft: { label: "草稿", type: "default" },
  published: { label: "已发布", type: "success" },
  closed: { label: "已关闭", type: "warning" },
};
export const SearchSchema: SearchFieldSchema<INoticeQuery>[] = [
  { field: "title", label: "标题" },
  { field: "type", label: "类型", component: "select", props: { options: NoticeTypeOptions } },
  { field: "status", label: "状态", component: "select", props: { options: NoticeStatusOptions } },
];
export const CreateColumns = (handlers: {
  onView: (row: INoticeRow) => void;
  onEdit: (row: INoticeRow) => void;
}): PageColumn<INoticeRow>[] => [
  { type: "index" },
  { key: "title", title: "标题", icon: Megaphone24Regular, minWidth: 220, ellipsis: { tooltip: true } },
  {
    key: "type",
    title: "类型",
    minWidth: 90,
    render: (row) =>
      h(
        NTag,
        { size: "small", type: row.type === "announcement" ? "warning" : "info" },
        { default: () => (row.type === "announcement" ? "公告" : "通知") },
      ),
  },
  {
    key: "status",
    title: "状态",
    icon: Status24Regular,
    minWidth: 100,
    render: (row) =>
      h(NTag, { size: "small", type: statusMeta[row.status].type }, { default: () => statusMeta[row.status].label }),
  },
  {
    key: "publishAt",
    title: "发布时间",
    icon: CalendarLtr24Regular,
    minWidth: 170,
    render: (row) => (row.publishAt ? new Date(row.publishAt).toLocaleString("zh-CN") : "-"),
  },
  {
    key: "updatedAt",
    title: "最后更新",
    icon: CalendarLtr24Regular,
    minWidth: 170,
    render: (row) => new Date(row.updatedAt).toLocaleString("zh-CN"),
  },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 190,
    actions: [
      { label: "查看", icon: Eye24Regular, auth: "system:notice:query", onClick: handlers.onView },
      { label: "编辑", icon: Edit24Regular, auth: "system:notice:update", onClick: handlers.onEdit },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:notice:delete",
        confirm: (row) => `确定要删除「${row.title}」吗？`,
      },
    ],
  },
];
