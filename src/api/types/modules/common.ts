/** 接口统一返回响应格式 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，通常 200 表示成功 */
  code: number;
  /** 后端返回的提示信息 */
  message: string;
  /** 业务数据 */
  data: T;
}

/**
 * @deprecated 请使用 ApiResponse<T>。
 * 保留 IResponse 是为了兼容历史代码，新增代码不要继续扩散旧命名。
 */
export type IResponse<T = unknown> = ApiResponse<T>;

/** 分页返回数据 */
export interface IPaginationData<T> {
  /** 总数 */
  total: number;
  /** 当前页数据 */
  rows: T[];
}

/** 分页基础参数 */
export interface IPagination {
  /** 当前页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
}

/** 可审计字段（created_by / updated_at 等） */
export interface IAuditable {
  /** 创建人用户 ID */
  createdBy: number | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新人用户 ID */
  updatedBy: number | null;
  /** 更新时间 */
  updatedAt: string;
}
