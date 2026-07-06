import type { IAuditable, IConfig } from "@/api/types";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import {
  CalendarLtr24Regular,
  Delete24Regular,
  Edit24Regular,
  Options24Regular,
  Wrench24Regular,
} from "@vicons/fluent";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IConfigRow = IConfig & IAuditable;

export const configTypeOptions = [
  { label: "自定义", value: 0 },
  { label: "内置", value: 1 },
];

export const configTypeMap: Record<number, { label: string; type: "default" | "warning" }> = {
  0: { label: "自定义", type: "default" },
  1: { label: "内置", type: "warning" },
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

export const createConfigColumns = (handlers: IConfigColumnHandlers): DataTableColumns<IConfigRow> => [
  {
    title: RenderColumnTitle(Wrench24Regular, "参数名称"),
    key: "configName",
    minWidth: 140,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
  },
  {
    title: RenderColumnTitle(Wrench24Regular, "参数键名"),
    key: "configKey",
    minWidth: 140,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
  },
  {
    title: RenderColumnTitle(Wrench24Regular, "参数键值"),
    key: "configValue",
    minWidth: 160,
    align: "center",
    titleAlign: "center",
    ellipsis: { tooltip: true },
  },
  {
    title: RenderColumnTitle(Wrench24Regular, "系统内置"),
    key: "configType",
    width: 100,
    align: "center",
    titleAlign: "center",
    render: (row) => {
      const current = configTypeMap[Number(row.configType)] ?? { label: "未知", type: "default" as const };
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
          default: () => [
            renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row)),
            Number(row.configType) === 1
              ? null
              : renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row)),
          ].filter(Boolean),
        },
      ),
  },
];
