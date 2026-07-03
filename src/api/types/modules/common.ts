/** 接口统一返回响应格式 */
export interface IResponse<T = undefined> {
  /** 状态码 */
  code: number;
  /**提示信息 */
  msg: string;
  /** 返回数据集 */
  data?: T;
}

/** 分页返回数据集 */
export interface IPaginationData<T> {
  /** 总数 */
  total: number;
  /** 数据集 */
  rows: T[];
}

/** 分页基础类型 */
export interface IPagination {
  /** 页数 */
  pageNum: number;
  /** 页码 */
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
