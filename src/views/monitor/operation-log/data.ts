import type { IOperLog, IQueryOperLogParams } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Eye24Regular from "@vicons/fluent/es/Eye24Regular";
import Globe24Regular from "@vicons/fluent/es/Globe24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

/** 搜索区的查询模型 */
export type IOperLogQuery = Pick<IQueryOperLogParams, "module" | "username" | "status">;

/** 操作状态下拉选项（搜索区） */
export const operStatusOptions = [
  { label: "成功", value: "success" },
  { label: "失败", value: "fail" },
];

/** 操作状态 -> 标签展示映射（列表列与详情抽屉共用） */
export const operStatusMap: Record<string, { label: string; type: "success" | "error" }> = {
  success: { label: "成功", type: "success" },
  fail: { label: "失败", type: "error" },
};

/** 搜索表单 schema */
export const searchSchema: SearchFieldSchema<IOperLogQuery>[] = [
  { field: "module", label: "业务模块" },
  { field: "username", label: "操作人员" },
  { field: "status", label: "操作状态", component: "select", props: { options: operStatusOptions } },
];

/** 列定义工厂：查看详情回调由页面注入 */
export const createColumns = (handlers: { onDetail: (row: IOperLog) => void }): PageColumn<IOperLog>[] => [
  { type: "index" },
  {
    key: "module",
    title: "模块标题",
    icon: TextBulletListSquare24Regular,
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: (row) => row.module || "-",
  },
  { key: "username", title: "操作人员", icon: Person24Regular, width: 120, render: (row) => row.username || "-" },
  {
    key: "requestUrl",
    title: "请求地址",
    icon: Globe24Regular,
    minWidth: 160,
    ellipsis: { tooltip: true },
    render: (row) => row.requestUrl || "-",
  },
  { key: "requestIp", title: "操作 IP", icon: Globe24Regular, width: 140, render: (row) => row.requestIp || "-" },
  {
    key: "status",
    title: "操作状态",
    icon: Status24Regular,
    width: 100,
    render: (row) => {
      const current = operStatusMap[row.status] ?? { label: "未知", type: "error" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
  },
  { key: "operatedAt", title: "操作时间", icon: CalendarLtr24Regular, width: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    width: 140,
    actions: [
      { label: "详情", icon: Eye24Regular, onClick: handlers.onDetail },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:operation-log:delete",
        confirm: () => "确定要删除该操作日志吗？",
      },
    ],
  },
];
