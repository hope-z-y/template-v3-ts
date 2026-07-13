import type { IPagination, IPaginationData } from "../../common";
import type { CommonStatus, EntityId, Gender, ISystemAudit } from "../common";

export interface IUser extends ISystemAudit {
  account: string;
  username: string;
  phone: string | null;
  email: string | null;
  avatar: string | null;
  gender: Gender;
  status: CommonStatus;
  deptId: EntityId | null;
  department: {
    id: EntityId;
    deptName: string;
    deptCode: string;
    parentId: EntityId | null;
    status: CommonStatus;
  } | null;
  roles: Array<{ id: EntityId; roleName: string; roleKey: string }>;
  posts: Array<{ id: EntityId; postName: string; postCode: string }>;
  lastLoginIp?: string | null;
  lastLoginAt?: string | null;
  passwordUpdatedAt?: string | null;
}

export interface IQueryUserParams extends IPagination {
  account?: string;
  username?: string;
  phone?: string;
  email?: string;
  deptId?: EntityId[];
  status?: CommonStatus;
}

export interface ICreateUserParams {
  account: string;
  username: string;
  password: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: Gender;
  status?: CommonStatus;
  deptId?: EntityId;
  roleIds?: EntityId[];
  postIds?: EntityId[];
  remark?: string;
}

export type IUpdateUserParams = Partial<Omit<ICreateUserParams, "password">>;
export interface IResetUserPasswordParams {
  password: string;
}
export type IUserDetail = IUser;
export type IUserList = IPaginationData<IUser>;
export type IUserOption = Pick<IUser, "id" | "account" | "username">;
export type IGetAllUsersResponse = IUserOption[];
