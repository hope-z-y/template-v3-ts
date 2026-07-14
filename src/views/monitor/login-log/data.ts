import type { ILoginLog, IQueryLoginLogParams } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Eye24Regular from "@vicons/fluent/es/Eye24Regular";
import Globe24Regular from "@vicons/fluent/es/Globe24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

/** 搜索区的查询模型 */
export type ILoginLogQuery = Pick<IQueryLoginLogParams, "username" | "status">;

/** 登录状态下拉选项（搜索区） */
export const loginStatusOptions = [
  { label: "成功", value: "success" },
  { label: "失败", value: "fail" },
];

/** 登录状态 -> 标签展示映射（列表列与详情弹窗共用） */
export const loginStatusMap: Record<string, { label: string; type: "success" | "error" }> = {
  success: { label: "成功", type: "success" },
  fail: { label: "失败", type: "error" },
};

/** 搜索表单 schema */
export const searchSchema: SearchFieldSchema<ILoginLogQuery>[] = [
  { field: "username", label: "登录用户" },
  { field: "status", label: "登录状态", component: "select", props: { options: loginStatusOptions } },
];

/** 列定义工厂：查看详情回调由页面注入 */
export const createColumns = (handlers: { onDetail: (row: ILoginLog) => void }): PageColumn<ILoginLog>[] => [
  { type: "index" },
  { key: "username", title: "登录账号", icon: Person24Regular, minWidth: 120, ellipsis: { tooltip: true } },
  { key: "loginIp", title: "登录 IP", icon: Globe24Regular, width: 140, render: (row) => row.loginIp || "-" },
  {
    key: "loginLocation",
    title: "登录地点",
    icon: Globe24Regular,
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: (row) => row.loginLocation || "-",
  },
  {
    key: "browser",
    title: "浏览器",
    icon: Globe24Regular,
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: (row) => row.browser || "-",
  },
  {
    key: "os",
    title: "操作系统",
    icon: Globe24Regular,
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: (row) => row.os || "-",
  },
  {
    key: "status",
    title: "登录状态",
    icon: Status24Regular,
    width: 100,
    render: (row) => {
      const current = loginStatusMap[row.status] ?? { label: "未知", type: "error" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
  },
  {
    key: "message",
    title: "提示消息",
    icon: Status24Regular,
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: (row) => row.message || "-",
  },
  { key: "loginAt", title: "登录时间", icon: CalendarLtr24Regular, width: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    width: 140,
    actions: [
      {
        label: "详情",
        icon: Eye24Regular,
        onClick: handlers.onDetail,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:login-log:delete",
        confirm: () => "确定要删除该登录日志吗？",
      },
    ],
  },
];
