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
  { label: "正常", value: 0 },
  { label: "异常", value: 1 },
];

export const operStatusMap: Record<number, { label: string; type: "success" | "error" }> = {
  0: { label: "正常", type: "success" },
  1: { label: "异常", type: "error" },
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
      key: "title",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.title || "-",
    },
    {
      title: RenderColumnTitle(Person24Regular, "操作人员"),
      key: "operName",
      width: 120,
      align: "center",
      titleAlign: "center",
      render: (row) => row.operName || "-",
    },
    {
      title: RenderColumnTitle(Person24Regular, "部门"),
      key: "deptName",
      width: 120,
      align: "center",
      titleAlign: "center",
      render: (row) => row.deptName || "-",
    },
    {
      title: RenderColumnTitle(Globe24Regular, "请求地址"),
      key: "operUrl",
      minWidth: 160,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.operUrl || "-",
    },
    {
      title: RenderColumnTitle(Globe24Regular, "操作 IP"),
      key: "operIp",
      width: 140,
      align: "center",
      titleAlign: "center",
      render: (row) => row.operIp || "-",
    },
    {
      title: RenderColumnTitle(Status24Regular, "操作状态"),
      key: "status",
      width: 100,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = operStatusMap[Number(row.status)] ?? { label: "未知", type: "error" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "操作时间"),
      key: "operTime",
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
                userStore.hasPermission("monitor:operation-log:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
