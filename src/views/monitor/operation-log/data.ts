import type { IOperLog } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Eye24Regular from "@vicons/fluent/es/Eye24Regular";
import Globe24Regular from "@vicons/fluent/es/Globe24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const operStatusOptions = [
  { label: "成功", value: "success" },
  { label: "失败", value: "fail" },
];

export const operStatusMap: Record<string, { label: string; type: "success" | "error" }> = {
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

export interface IOperLogColumnHandlers {
  onDelete: (row: IOperLog) => void;
  onDetail: (row: IOperLog) => void;
}

export const createOperLogColumns = (handlers: IOperLogColumnHandlers): DataTableColumns<IOperLog> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "模块标题"),
      key: "module",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.module || "-",
    },
    {
      title: RenderColumnTitle(Person24Regular, "操作人员"),
      key: "username",
      width: 120,
      align: "center",
      titleAlign: "center",
      render: (row) => row.username || "-",
    },
    {
      title: RenderColumnTitle(Globe24Regular, "请求地址"),
      key: "requestUrl",
      minWidth: 160,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.requestUrl || "-",
    },
    {
      title: RenderColumnTitle(Globe24Regular, "操作 IP"),
      key: "requestIp",
      width: 140,
      align: "center",
      titleAlign: "center",
      render: (row) => row.requestIp || "-",
    },
    {
      title: RenderColumnTitle(Status24Regular, "操作状态"),
      key: "status",
      width: 100,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = operStatusMap[row.status] ?? { label: "未知", type: "error" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "操作时间"),
      key: "operatedAt",
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
                renderActionButton("详情", Eye24Regular, "primary", () => handlers.onDetail(row)),
                userStore.hasPermission("system:operation-log:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
