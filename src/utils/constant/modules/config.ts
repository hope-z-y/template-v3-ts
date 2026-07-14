import type { ParameterType } from "@/api/types";

type ConfigTypeTagType = "default" | "warning";

/** 参数类型选项 */
export const ConfigTypeOptions = [
  { label: "业务参数", value: "business" },
  { label: "系统参数", value: "system" },
];

/** 参数类型 -> 标签展示映射 */
export const ConfigTypeMap: Record<ParameterType, { label: string; type: ConfigTypeTagType }> = {
  business: { label: "业务参数", type: "default" },
  system: { label: "系统参数", type: "warning" },
};
