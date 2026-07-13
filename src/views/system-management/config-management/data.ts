import type { IConfig } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Wrench24Regular from "@vicons/fluent/es/Wrench24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IConfigRow = IConfig;

export const configTypeOptions = [
  { label: "业务参数", value: "business" },
  { label: "系统参数", value: "system" },
];

export const configTypeMap: Record<string, { label: string; type: "default" | "warning" }> = {
  business: { label: "业务参数", type: "default" },
  system: { label: "系统参数", type: "warning" },
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

export interface IConfigColumnHandlers {
  onEdit: (row: IConfigRow) => void;
  onDelete: (row: IConfigRow) => void;
}

export const createConfigColumns = (handlers: IConfigColumnHandlers): DataTableColumns<IConfigRow> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Wrench24Regular, "参数名称"),
      key: "paramName",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Wrench24Regular, "参数键名"),
      key: "paramKey",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Wrench24Regular, "参数键值"),
      key: "paramValue",
      minWidth: 160,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Wrench24Regular, "系统内置"),
      key: "paramType",
      width: 100,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = configTypeMap[row.paramType] ?? { label: "未知", type: "default" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "创建时间"),
      key: "createdAt",
      width: 180,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Options24Regular, "操作"),
      key: "actions",
      width: 170,
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
                userStore.hasPermission("system:parameter:update")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                row.paramType === "system" || !userStore.hasPermission("system:parameter:delete")
                  ? null
                  : renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row)),
              ].filter(Boolean),
          },
        ),
    },
  ];
};
