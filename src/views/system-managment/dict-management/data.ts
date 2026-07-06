import type { IAuditable, IDictData, IDictType } from "@/api/types";
import { RenderColumnTitle, StatusMap, type NaiveType, type Status } from "@/utils";
import {
  Book24Regular,
  CalendarLtr24Regular,
  Delete24Regular,
  Edit24Regular,
  Options24Regular,
  Status24Regular,
  TextNumberFormat24Regular,
} from "@vicons/fluent";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IDictTypeRow = IDictType & IAuditable;
export type IDictDataRow = IDictData & IAuditable;

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export const isDefaultOptions = [
  { label: "是", value: 1 },
  { label: "否", value: 0 },
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

export const createDictTypeColumns = (handlers: IDictTypeColumnHandlers): DataTableColumns<IDictTypeRow> => [
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
      const current = StatusMap.get(row.status as Status) ?? { label: "未知", type: "error" };
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
          default: () => [
            renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row)),
            renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row)),
          ],
        },
      ),
  },
];

export const createDictDataColumns = (handlers: IDictDataColumnHandlers): DataTableColumns<IDictDataRow> => [
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
    key: "dictSort",
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
      const current = StatusMap.get(row.status as Status) ?? { label: "未知", type: "error" };
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
          default: () => [
            renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row)),
            renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row)),
          ],
        },
      ),
  },
];
