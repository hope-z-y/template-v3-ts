import type { Gender } from "@/api/types";

type GenderOption = { label: string; value: Gender };

/** 性别选项 */
export const GenderOptions: GenderOption[] = [
  { label: "未知", value: "unknown" },
  { label: "男", value: "male" },
  { label: "女", value: "female" },
];

/** 性别枚举 -> 展示文案 */
export const GenderMap: Record<Gender, string> = {
  unknown: "未知",
  male: "男",
  female: "女",
};
