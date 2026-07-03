import type { Status } from "@/utils";
import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** 用户基础信息 */
export interface IUser {
  id: number;
  /** 登录用户名，2-50 字符 */
  username: string;
  /** 昵称 */
  nickname?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 性别：0未知 1男 2女 */
  gender?: number;
  /** 头像 */
  avatar?: string;
  /** 部门数据*/
  dept: {
    /** 所属部门 ID */
    deptId?: number;
    /** 部门名称 */
    deptName?: string;
  };
  /** 状态：1启用 0禁用 */
  status: Status;
  /** 备注 */
  remark?: string;
}

/** GET /system/users 查询参数 */
export type IQueryUserParams = IPagination & Partial<Omit<IUser, "id">>;

/** POST /system/users 请求体 */
export type ICreateUserParams = Omit<IUser, "id"> & {
  /** 角色 ID 列表 */
  roleIds?: number[];
  /** 岗位 ID 列表 */
  postIds?: number[];
  /** 密码 */
  password?: string;
};

/** PATCH /system/users/:id 请求体（所有字段可选，password 留空则不修改） */
export type IUpdateUserParams = Partial<Omit<ICreateUserParams, "password">>;

/** GET /system/users 响应数据 */
export type IUserList = IPaginationData<IUser & IAuditable>;

/** GET /system/users/all 下拉选项用户 */
export type IUserOption = Pick<IUser, "id" | "username" | "nickname" | "phone" | "email" | "dept" | "status">;

/** GET /system/users/all 响应体 */
export type IGetAllUsersResponse = IUserOption[];
