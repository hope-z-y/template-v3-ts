import type { IPagination, IPaginationData } from "../../common";
import type { EntityId, ISystemAudit } from "../common";

export type NoticeType = "notice" | "announcement";
export type NoticeStatus = "draft" | "published" | "closed";
export type NoticeTargetType = "all" | "department" | "role" | "user";

export interface INotice extends ISystemAudit {
  title: string;
  type: NoticeType;
  content: string;
  status: NoticeStatus;
  publishAt: string | null;
  targetType: NoticeTargetType;
  targetIds: string[];
  distributedAt: string | null;
}

export interface IQueryNoticeParams extends IPagination {
  title?: string;
  type?: NoticeType;
  status?: NoticeStatus;
  publishStartAt?: string;
  publishEndAt?: string;
}

export interface ICreateNoticeParams {
  title: string;
  type?: NoticeType;
  content: string;
  status?: NoticeStatus;
  publishAt?: string;
  targetType?: NoticeTargetType;
  targetIds?: string[];
  remark?: string;
}

export type IUpdateNoticeParams = Partial<ICreateNoticeParams>;
export type INoticeList = IPaginationData<INotice>;
export type NoticeId = EntityId;

export interface IUserNotice {
  id: EntityId;
  title: string;
  type: NoticeType;
  content: string;
  publishAt: string | null;
  readAt: string | null;
  createdAt?: string;
}
export interface IQueryUserNoticeParams extends IPagination {
  unreadOnly?: boolean;
}
export type IUserNoticeList = IPaginationData<IUserNotice>;
export interface INoticeTargetOptions {
  departments: Array<{ id: EntityId; deptName: string; parentId: EntityId | null }>;
  roles: Array<{ id: EntityId; roleName: string; roleKey: string }>;
  users: Array<{ id: EntityId; account: string; username: string; deptId: EntityId | null }>;
}
