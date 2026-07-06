import type { Status } from "@/utils";
import type { IAuditable, IPagination, IPaginationData } from "../../common";

/** 用户基础信息 */
export interface IUser {
  id: number;
  /** 登录用户名，2-50 字符 */
  account: string;
  /** 昵称 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 性别：0未知 1男 2女 */
  gender?: number;
  /** 头像 */
  avatar?: string;
  /** 部门数据*/
  dept?: {
    /** 所属部门 ID */
    deptId?: number;
    /** 部门 id（后端实体字段） */
    id?: number;
    /** 部门名称 */
    deptName?: string;
  } | null;
  /** 状态：1启用 0禁用 */
  status: Status;
  /** 备注 */
  remark?: string;
}

/** GET /system/users 查询参数 */
export type IQueryUserParams = IPagination &
  Partial<Omit<IUser, "id" | "dept" | "avatar">> & {
    /** 所属部门 ID */
    deptId?: number;
    /** 角色 ID */
    roleId?: number;
    /** 岗位 ID */
    postId?: number;
  };

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
export type IUpdateUserParams = Partial<Omit<ICreateUserParams, "dept">> & {
  /** RSA 加密后的密码，仅重置密码时使用 */
  password?: string;
  /** 所属部门 ID */
  deptId?: number | null;
};

/** GET /system/users/:id 用户详情（含角色、岗位关联） */
export interface IUserDetail extends IUser {
  deptId?: number | null;
  userRoles?: Array<{
    roleId: number;
    role?: { id: number; roleName: string; roleCode: string };
  }>;
  userPosts?: Array<{
    postId: number;
    post?: { id: number; postName: string; postCode: string };
  }>;
}

/** GET /system/users 响应数据 */
export type IUserList = IPaginationData<IUser & IAuditable>;

/** GET /system/users/all 下拉选项用户 */
export type IUserOption = Pick<IUser, "id" | "account" | "username" | "phone" | "email" | "dept" | "status">;

/** GET /system/users/all 响应体 */
export type IGetAllUsersResponse = IUserOption[];
