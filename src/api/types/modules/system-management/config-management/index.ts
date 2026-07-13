import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, ISystemAudit, ParameterType } from "../common";

export interface IQueryConfigParams extends IPagination {
  paramName?: string;
  paramKey?: string;
  paramType?: ParameterType;
  status?: CommonStatus;
}
export interface ICreateConfigParams {
  paramName: string;
  paramKey: string;
  paramValue: string;
  paramType?: ParameterType;
  isEncrypted?: boolean;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdateConfigParams = Partial<ICreateConfigParams>;
export interface IConfig extends ISystemAudit {
  paramName: string;
  paramKey: string;
  paramValue: string;
  paramType: ParameterType;
  isEncrypted: boolean;
  status: CommonStatus;
}
export type IGetConfigListResponse = IPaginationData<IConfig>;
