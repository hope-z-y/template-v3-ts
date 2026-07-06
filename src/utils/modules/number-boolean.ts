/**
 * 数字布尔约定（前后端统一）：
 * - 1 = true（显示 / 启用 / 是 / 缓存 …）
 * - 0 = false（隐藏 / 禁用 / 否 / 不缓存 …）
 */
export const isNumericTrue = (value: unknown): boolean => Number(value) === 1;

export const isNumericFalse = (value: unknown): boolean => Number(value) === 0;
