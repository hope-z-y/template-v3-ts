import { request } from "@/request";
import type {
  ICreateNoticeParams,
  INotice,
  INoticeList,
  INoticeTargetOptions,
  IQueryNoticeParams,
  IQueryUserNoticeParams,
  IUpdateNoticeParams,
  IUserNotice,
  IUserNoticeList,
} from "../../types";

export const GetNoticeList = (params: IQueryNoticeParams) => {
  return request.get<string, INoticeList>("/system/notice", { params });
};

export const GetNoticeById = (id: string) => {
  return request.get<string, INotice>(`/system/notice/${id}`);
};

export const CreateNotice = (data: ICreateNoticeParams) => {
  return request.post<string, string>("/system/notice", data);
};

export const UpdateNotice = (id: string, data: IUpdateNoticeParams) => {
  return request.patch<string, string>(`/system/notice/${id}`, data);
};

export const DeleteNotice = (id: string) => {
  return request.delete<string, string>(`/system/notice/${id}`);
};

/** 以下接口面向当前登录用户的收件箱，不需要公告管理权限。 */
export const GetNoticeInbox = (params: IQueryUserNoticeParams) =>
  request.get<string, IUserNoticeList>("/system/notice/inbox", { params });
export const GetNoticeInboxDetail = (id: string) => request.get<string, IUserNotice>(`/system/notice/inbox/${id}`);
export const GetUnreadNoticeCount = () => request.get<string, number>("/system/notice/inbox/unread-count");
export const MarkAllNoticesRead = () => request.patch<string, boolean>("/system/notice/inbox/read-all");
/** 获取发布范围表单使用的部门、角色和用户候选项。 */
export const GetNoticeTargetOptions = () => request.get<string, INoticeTargetOptions>("/system/notice/target-options");
