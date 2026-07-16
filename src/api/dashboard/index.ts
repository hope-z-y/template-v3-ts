import { request } from "@/request";
import type { IDashboardOverview } from "@/api/types";

/** 获取当前用户可见的工作台指标、趋势和最近动态。 */
export const GetDashboardOverview = () => {
  return request.get<string, IDashboardOverview>("/system/dashboard/overview");
};
