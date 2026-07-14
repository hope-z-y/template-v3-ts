import type { DataScope } from "@/api/types";

/** 数据权限范围选项 */
export const DataScopeOptions = [
  { label: "全部数据权限", value: "all" },
  { label: "自定义数据权限", value: "custom" },
  { label: "本部门数据权限", value: "department" },
  { label: "本部门及以下数据权限", value: "department_and_children" },
  { label: "仅本人数据权限", value: "self" },
];

/** 数据权限范围 -> 文案映射 */
export const DataScopeMap: Record<DataScope, string> = {
  all: "全部数据权限",
  custom: "自定义数据权限",
  department: "本部门数据权限",
  department_and_children: "本部门及以下数据权限",
  self: "仅本人数据权限",
};
