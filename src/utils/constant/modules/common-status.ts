import type { CommonStatus } from "@/api/types";

type StatusTagType = "success" | "error";

type StatusOption = { label: string; value: CommonStatus };
type StatusMapItem = { label: string; type: StatusTagType };

/** 启用 / 禁用下拉选项（搜索区与表单共用） */
export const CommonStatusOptions: StatusOption[] = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
];

/** 启用 / 禁用 -> 标签展示映射（列表列渲染） */
export const CommonStatusMap: Record<CommonStatus, StatusMapItem> = {
  enabled: { label: "启用", type: "success" },
  disabled: { label: "禁用", type: "error" },
};
