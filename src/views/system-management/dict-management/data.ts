import type { IDictData, IDictType } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import Book24Regular from "@vicons/fluent/es/Book24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IDictTypeRow = IDictType;
export type IDictDataRow = IDictData;

export const statusOptions = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
];

export const isDefaultOptions = [
  { label: "是", value: true },
  { label: "否", value: false },
];

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

export interface IDictTypeColumnHandlers {
  onEdit: (row: IDictTypeRow) => void;
  onDelete: (row: IDictTypeRow) => void;
}

export interface IDictDataColumnHandlers {
  onEdit: (row: IDictDataRow) => void;
  onDelete: (row: IDictDataRow) => void;
}

export const createDictTypeColumns = (handlers: IDictTypeColumnHandlers): DataTableColumns<IDictTypeRow> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Book24Regular, "字典名称"),
      key: "dictName",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Book24Regular, "字典类型"),
      key: "dictType",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current =
          row.status === "enabled"
            ? { label: "启用", type: "success" as const }
            : { label: "禁用", type: "error" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
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
                userStore.hasPermission("system:dict-type:update")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:dict-type:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};

export const createDictDataColumns = (handlers: IDictDataColumnHandlers): DataTableColumns<IDictDataRow> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Book24Regular, "字典标签"),
      key: "dictLabel",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Book24Regular, "字典键值"),
      key: "dictValue",
      minWidth: 100,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "排序"),
      key: "sort",
      width: 80,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current =
          row.status === "enabled"
            ? { label: "启用", type: "success" as const }
            : { label: "禁用", type: "error" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "创建时间"),
      key: "createdAt",
      width: 170,
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
                userStore.hasPermission("system:dict-data:update")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:dict-data:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
