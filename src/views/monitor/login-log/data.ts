import type { ILoginLog } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Eye24Regular from "@vicons/fluent/es/Eye24Regular";
import Globe24Regular from "@vicons/fluent/es/Globe24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const loginStatusOptions = [
  { label: "成功", value: "success" },
  { label: "失败", value: "fail" },
];

export const loginStatusMap: Record<string, { label: string; type: "success" | "error" }> = {
  success: { label: "成功", type: "success" },
  fail: { label: "失败", type: "error" },
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

export const createLoginLogColumns = (handlers: ILoginLogColumnHandlers): DataTableColumns<ILoginLog> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Person24Regular, "登录账号"),
      key: "username",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Globe24Regular, "登录 IP"),
      key: "loginIp",
      width: 140,
      align: "center",
      titleAlign: "center",
      render: (row) => row.loginIp || "-",
    },
    {
      title: RenderColumnTitle(Globe24Regular, "登录地点"),
      key: "loginLocation",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.loginLocation || "-",
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
        const current = loginStatusMap[row.status] ?? { label: "未知", type: "error" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(Status24Regular, "提示消息"),
      key: "message",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.message || "-",
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "登录时间"),
      key: "loginAt",
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
                userStore.hasPermission("system:login-log:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
