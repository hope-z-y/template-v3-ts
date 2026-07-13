/**
 * 数字布尔约定（前后端统一）：
 * - 1 = true（显示 / 启用 / 是 / 缓存 …）
 * - 0 = false（隐藏 / 禁用 / 否 / 不缓存 …）
 */

/**
 * IsNumericTrue
 * 判断给定值按数字布尔约定是否为 true（即 Number(value) === 1）。
 *
 * @param value - 待判断的任意值
 * @returns boolean - 当 Number(value) 等于 1 时返回 true，否则返回 false
 */
export const IsNumericTrue = (value: unknown): boolean => Number(value) === 1;

/**
 * IsNumericFalse
 * 判断给定值按数字布尔约定是否为 false（即 Number(value) === 0）。
 *
 * @param value - 待判断的任意值
 * @returns boolean - 当 Number(value) 等于 0 时返回 true，否则返回 false
 */
export const IsNumericFalse = (value: unknown): boolean => Number(value) === 0;
