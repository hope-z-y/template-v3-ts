export type NaiveType = "default" | "primary" | "success" | "info" | "warning" | "error";

/** 状态 */
export const Status = {
  /** 禁用 */
  Disable: 0,
  /** 启用 */
  Enable: 1,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

type Option = { label: string; value: unknown; type: NaiveType };

/** 状态映射 */
export const StatusMap = new Map<Status, Option>([
  [Status.Disable, { label: "禁用", value: Status.Disable, type: "error" }],
  [Status.Enable, { label: "启用", value: Status.Enable, type: "success" }],
]);
