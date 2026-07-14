/**
 * usePage：列表页一站式 hook（vben useVbenVxeGrid 风格）。
 * 布局、搜索表单、数据表格、分页、工具栏、操作列、列显隐、删除确认全部内聚在本目录，
 * 对外只暴露 usePage 入口与类型定义。
 */
export { usePage } from "./use-page";

export type {
  PageApi,
  PageColumn,
  PageDataColumn,
  PageRowAction,
  PageToolbarAction,
  SearchFieldSchema,
  UsePageOptions,
} from "./types";
