import type { ILoginLog } from "@/api/types";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import {
  CalendarLtr24Regular,
  Delete24Regular,
  Eye24Regular,
  Globe24Regular,
  Options24Regular,
  Person24Regular,
  Status24Regular,
} from "@vicons/fluent";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const loginStatusOptions = [
  { label: "成功", value: 1 },
  { label: "失败", value: 0 },
];

export const loginStatusMap: Record<number, { label: string; type: "success" | "error" }> = {
  1: { label: "成功", type: "success" },
  0: { label: "失败", type: "error" },
};

const renderActionButton = (label: string, icon: Component, type: NaiveType, onClick: () => void) => {
  return h(
    NButton,
    { text: true, type, onClick },
    {
      icon: () => h(NIcon, null, { default: () => h(icon) }),
      default: () => label,
    },
  );
};

export interface ILoginLogColumnHandlers {
  onDelete: (row: ILoginLog) => void;
  onDetail?: (row: ILoginLog) => void;
}

export const createLoginLogColumns = (handlers: ILoginLogColumnHandlers): DataTableColumns<ILoginLog> => [
  {
    title: RenderColumnTitle(Person24Regular, "登录账号"),
    key: "account",
    minWidth: 120,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
  },
  {
    title: RenderColumnTitle(Globe24Regular, "登录 IP"),
    key: "ip",
    width: 140,
    align: "center",
    titleAlign: "center",
    render: (row) => row.ip || "-",
  },
  {
    title: RenderColumnTitle(Globe24Regular, "登录地点"),
    key: "location",
    minWidth: 120,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
    render: (row) => row.location || "-",
  },
  {
    title: RenderColumnTitle(Globe24Regular, "浏览器"),
    key: "browser",
    minWidth: 120,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
    render: (row) => row.browser || "-",
  },
  {
    title: RenderColumnTitle(Globe24Regular, "操作系统"),
    key: "os",
    minWidth: 120,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
    render: (row) => row.os || "-",
  },
  {
    title: RenderColumnTitle(Status24Regular, "登录状态"),
    key: "status",
    width: 100,
    align: "center",
    titleAlign: "center",
    render: (row) => {
      const current = loginStatusMap[Number(row.status)] ?? { label: "未知", type: "error" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
  },
  {
    title: RenderColumnTitle(Status24Regular, "提示消息"),
    key: "msg",
    minWidth: 140,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
    render: (row) => row.msg || "-",
  },
  {
    title: RenderColumnTitle(CalendarLtr24Regular, "登录时间"),
    key: "loginTime",
    width: 180,
    align: "center",
    titleAlign: "center",
  },
  {
    title: RenderColumnTitle(Options24Regular, "操作"),
    key: "actions",
    width: 140,
    align: "center",
    titleAlign: "center",
    fixed: "right",
    render: (row) =>
      h(
        NSpace,
        { size: 8, justify: "center", inline: true },
        {
          default: () =>
            [
              handlers.onDetail
                ? renderActionButton("详情", Eye24Regular, "primary", () => handlers.onDetail!(row))
                : null,
              renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row)),
            ].filter(Boolean),
        },
      ),
  },
];
