import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, EntityId, ISystemAudit } from "../common";

export interface IQueryDictTypeParams extends IPagination {
  dictName?: string;
  dictType?: string;
  status?: CommonStatus;
}
export interface ICreateDictTypeParams {
  dictName: string;
  dictType: string;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdateDictTypeParams = Partial<ICreateDictTypeParams>;
export interface IDictType extends ISystemAudit {
  dictName: string;
  dictType: string;
  status: CommonStatus;
}
export type IGetDictTypeListResponse = IPaginationData<IDictType>;

export interface IQueryDictDataParams extends IPagination {
  dictTypeId?: EntityId;
  dictLabel?: string;
  dictValue?: string;
  status?: CommonStatus;
}
export interface ICreateDictDataParams {
  dictTypeId: EntityId;
  dictLabel: string;
  dictValue: string;
  cssClass?: string;
  listClass?: string;
  isDefault?: boolean;
  sort?: number;
  status?: CommonStatus;
  remark?: string;
}
export type IUpdateDictDataParams = Partial<ICreateDictDataParams>;
export interface IDictData extends ISystemAudit {
  dictTypeId: EntityId;
  dictLabel: string;
  dictValue: string;
  cssClass: string | null;
  listClass: string | null;
  isDefault: boolean;
  sort: number;
  status: CommonStatus;
}
export type IGetDictDataListResponse = IPaginationData<IDictData>;
export type IGetDictDataByTypeResponse = IDictData[];
