import type { CommonStatus, IDictData, IDictType } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusOptions } from "@/utils/constant";
import Book24Regular from "@vicons/fluent/es/Book24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

export type IDictTypeRow = IDictType;
export type IDictDataRow = IDictData;

/** 左表（字典类型）的查询模型 */
export interface IDictTypeQuery {
  dictName?: string;
  dictType?: string;
  status?: CommonStatus | null;
}

/** 右表（字典数据）的查询模型 */
export interface IDictDataQuery {
  dictLabel?: string;
  dictValue?: string;
  status?: CommonStatus | null;
}

/** 右表的查询参数：由 buildParams 构建，携带混合模式判断所需的全部条件 */
export interface IDictDataListParams {
  pageNum: number;
  pageSize: number;
  dictLabel?: string;
  dictValue?: string;
  status?: CommonStatus | null;
}

/** 字典类型弹窗的共享数据 */
export interface IDictTypeModalData {
  mode: "create" | "edit";
  record: IDictTypeRow | null;
}

/** 字典数据弹窗的共享数据：额外携带当前选中的字典类型信息 */
export interface IDictDataModalData {
  mode: "create" | "edit";
  record: IDictDataRow | null;
  dictType?: string;
  dictTypeId?: string;
}

/** 渲染启用 / 禁用标签（两张表共用） */
const renderStatusTag = (status: CommonStatus) =>
  status === "enabled"
    ? h(NTag, { type: "success", size: "small" }, { default: () => "启用" })
    : h(NTag, { type: "error", size: "small" }, { default: () => "禁用" });

/* -------------------------------- 左表：字典类型 -------------------------------- */

/** 左表搜索 schema */
export const TypeSearchSchema: SearchFieldSchema<IDictTypeQuery>[] = [
  { field: "dictName", label: "字典名称" },
  { field: "dictType", label: "字典类型" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
];

const matchesTypeQuery = (row: IDictTypeRow, query: IDictTypeQuery): boolean => {
  const dictName = query.dictName?.trim();
  const dictType = query.dictType?.trim();

  if (dictName && !row.dictName.includes(dictName)) return false;
  if (dictType && !row.dictType.includes(dictType)) return false;
  if (query.status !== undefined && query.status !== null && row.status !== query.status) return false;

  return true;
};

/** 左表客户端过滤（全量模式） */
export const FilterTypeRows = (rows: IDictTypeRow[], query: IDictTypeQuery): IDictTypeRow[] =>
  rows.filter((row) => matchesTypeQuery(row, query));

/** 左表列定义工厂：编辑 / 删除回调由页面注入（删除需要联动清空右表选中态） */
export const CreateTypeColumns = (handlers: {
  onEdit: (row: IDictTypeRow) => void;
  onDelete: (row: IDictTypeRow) => unknown;
}): PageColumn<IDictTypeRow>[] => [
  { key: "dictName", title: "字典名称", icon: Book24Regular, minWidth: 120, ellipsis: { tooltip: true } },
  { key: "dictType", title: "字典类型", icon: Book24Regular, minWidth: 120, ellipsis: { tooltip: true } },
  { key: "status", title: "状态", icon: Status24Regular, minWidth: 100, render: (row) => renderStatusTag(row.status) },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 140,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:dict-type:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:dict-type:delete",
        confirm: (row) => `确定要删除字典类型「${row.dictName}」吗？`,
        onConfirm: handlers.onDelete,
      },
    ],
  },
];

/* -------------------------------- 右表：字典数据 -------------------------------- */

/**
 * 右表搜索 schema 工厂：未选中左表类型时禁用全部搜索项，
 * 选中态是页面里的响应式状态，通过 getter 注入
 */
export const CreateDataSearchSchema = (deps: {
  isTypeSelected: () => boolean;
}): SearchFieldSchema<IDictDataQuery>[] => [
  { field: "dictLabel", label: "字典标签", disabled: () => !deps.isTypeSelected() },
  { field: "dictValue", label: "字典键值", disabled: () => !deps.isTypeSelected() },
  {
    field: "status",
    label: "状态",
    component: "select",
    props: { options: CommonStatusOptions },
    disabled: () => !deps.isTypeSelected(),
  },
];

/** 右表查询参数构建（混合取数策略在页面的 fetcher 里判断） */
export const BuildDictDataParams = (query: IDictDataQuery, page: number, pageSize: number): IDictDataListParams => ({
  pageNum: page,
  pageSize,
  dictLabel: query.dictLabel?.trim() || undefined,
  dictValue: query.dictValue?.trim() || undefined,
  status: query.status,
});

/** 右表客户端过滤（混合模式下对全量数据过滤） */
export const FilterDictDataRows = (rows: IDictDataRow[], params: IDictDataListParams): IDictDataRow[] => {
  return rows.filter((row) => {
    if (params.dictLabel && !row.dictLabel.includes(params.dictLabel)) return false;
    if (params.dictValue && !row.dictValue.includes(params.dictValue)) return false;
    if (params.status !== undefined && params.status !== null && row.status !== params.status) return false;
    return true;
  });
};

/** 右表列定义工厂：编辑回调由页面注入 */
export const CreateDataColumns = (handlers: { onEdit: (row: IDictDataRow) => void }): PageColumn<IDictDataRow>[] => [
  { key: "dictLabel", title: "字典标签", icon: Book24Regular, minWidth: 120, ellipsis: { tooltip: true } },
  { key: "dictValue", title: "字典键值", icon: Book24Regular, minWidth: 100, ellipsis: { tooltip: true } },
  { key: "sort", title: "排序", icon: TextNumberFormat24Regular, minWidth: 90 },
  { key: "status", title: "状态", icon: Status24Regular, minWidth: 100, render: (row) => renderStatusTag(row.status) },
  { key: "createdAt", title: "创建时间", icon: CalendarLtr24Regular, minWidth: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 140,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:dict-data:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:dict-data:delete",
        confirm: (row) => `确定要删除字典数据「${row.dictLabel}」吗？`,
      },
    ],
  },
];
