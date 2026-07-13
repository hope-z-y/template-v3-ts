/** 后端雪花主键及所有外键均按字符串传输，避免 JavaScript 数值精度丢失。 */
export type EntityId = string;

export type CommonStatus = "enabled" | "disabled";
export type Gender = "unknown" | "male" | "female";
export type DataScope = "all" | "custom" | "department" | "department_and_children" | "self";
export type MenuType = "directory" | "menu" | "button";
export type LogStatus = "success" | "fail";
export type ParameterType = "system" | "business";
export type OperationType =
  "other" | "create" | "update" | "delete" | "query" | "export" | "import" | "login" | "logout";

/** 系统管理实体共有的审计响应字段。 */
export interface ISystemAudit {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
  createdById: EntityId | null;
  updatedById: EntityId | null;
  remark: string | null;
}
