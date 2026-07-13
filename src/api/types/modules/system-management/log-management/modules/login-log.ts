import type { IPagination, IPaginationData } from "../../../common";
import type { EntityId, LogStatus } from "../../common";

export interface IQueryLoginLogParams extends IPagination {
  userId?: EntityId;
  username?: string;
  loginIp?: string;
  status?: LogStatus;
  loginStartAt?: string;
  loginEndAt?: string;
}
export interface ILoginLog {
  id: EntityId;
  userId: EntityId | null;
  username: string | null;
  loginIp: string | null;
  loginLocation: string | null;
  browser: string | null;
  os: string | null;
  status: LogStatus;
  message: string | null;
  loginAt: string;
}
export type IGetLoginLogListResponse = IPaginationData<ILoginLog>;
