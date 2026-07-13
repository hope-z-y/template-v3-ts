import type { IPagination, IPaginationData } from "../../../common";
import type { EntityId, LogStatus, OperationType } from "../../common";

export interface IQueryOperLogParams extends IPagination {
  traceId?: string;
  userId?: EntityId;
  username?: string;
  module?: string;
  operationType?: OperationType;
  status?: LogStatus;
  operatedStartAt?: string;
  operatedEndAt?: string;
}
export interface IOperLog {
  id: EntityId;
  traceId: string | null;
  userId: EntityId | null;
  username: string | null;
  module: string;
  operationType: OperationType;
  method: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestIp: string | null;
  requestLocation: string | null;
  requestParams: string | null;
  responseResult: string | null;
  status: LogStatus;
  errorMessage: string | null;
  costTimeMs: number | null;
  operatedAt: string;
}
export type IGetOperLogListResponse = IPaginationData<IOperLog>;
