import type { DataTableBaseColumn, DataTableProps, PaginationProps } from "naive-ui";
import type { Component, ComputedRef, Ref, VNodeChild } from "vue";
import type { NaiveType } from "@/utils";

/* -------------------------------------------------------------------------- */
/*                                查询 / 数据加载                               */
/* -------------------------------------------------------------------------- */

/**
 * 列表接口的返回结果，支持两种形态：
 * 1. `{ rows, total }`：服务端分页列表（用户、岗位、日志等）
 * 2. `TRow[]`：一次性返回全量数据（部门树、菜单树等），此时组件进入"树形/全量模式"，
 *    不再渲染分页器，搜索走客户端过滤（clientFilter）
 */
export type PageListResult<TRow> = { rows: TRow[]; total: number } | TRow[];

export interface PageApiOptions<TRow, TParams> {
  /** 列表查询接口。参数由 search.buildParams 构建（未提供时使用默认构建规则） */
  list: (params: TParams) => Promise<PageListResult<TRow>>;
  /**
   * 删除接口。行操作 / 工具栏动作里配置了 confirm 且未提供 onConfirm 时，
   * 确认后默认调用它并自动刷新列表。
   * 返回类型宽松处理（unknown），接口返回什么都不影响
   */
  delete?: (row: TRow) => unknown;
}

/** 搜索区支持的内置控件。不在白名单内的场景请用字段级 render 或整块 search 插槽逃生 */
export type SearchComponentType = "input" | "input-number" | "select" | "tree-select" | "date-range";

export interface SearchFieldSchema<TQuery> {
  /** 绑定到查询模型（pageApi.query）上的字段名 */
  field: keyof TQuery & string;
  /** 表单项 label */
  label: string;
  /** 控件类型，默认 input */
  component?: SearchComponentType;
  /** 占位文案，默认按控件类型自动生成"请输入/请选择 + label" */
  placeholder?: string;
  /**
   * 透传给控件的额外 props（如 select 的 options）。
   * 支持函数形式，用于依赖响应式数据的场景（如异步加载的部门树 options）
   */
  props?: Record<string, unknown> | (() => Record<string, unknown>);
  /** 是否禁用该搜索项（如字典数据表未选中字典类型时禁用搜索） */
  disabled?: () => boolean;
  /** 字段级逃生舱：完全自定义该表单项的控件（label 仍由 schema 渲染） */
  render?: () => VNodeChild;
}

export interface PageSearchOptions<TRow, TQuery, TParams> {
  /**
   * 查询模型的默认值工厂。必须枚举出所有字段（值可为 undefined），
   * 这样"重置"时 Object.assign 才能把每个字段都还原
   */
  defaults: () => TQuery;
  /** 声明式搜索表单配置，覆盖 80% 常规场景 */
  schema?: SearchFieldSchema<TQuery>[];
  /**
   * 服务端查询参数构建器（分页模式使用）。
   * 未提供时默认规则：字符串 trim 后非空才携带、null/undefined 丢弃，并附加 pageNum/pageSize
   */
  buildParams?: (query: TQuery, page: number, pageSize: number) => TParams;
  /**
   * 客户端过滤器（树形/全量模式使用）。
   * query 是响应式的，因此过滤结果会随输入实时联动（与现部门/菜单页行为一致）
   */
  clientFilter?: (rows: TRow[], query: TQuery) => TRow[];
  /** 搜索区每行的最大表单项列数，默认 3；实际列数会随容器宽度自动调整 */
  columns?: number;
  /** 整块逃生舱：完全接管搜索区渲染（schema 配置将被忽略） */
  render?: () => VNodeChild;
}

/* -------------------------------------------------------------------------- */
/*                                    列定义                                   */
/* -------------------------------------------------------------------------- */

/** 行操作按钮（操作列内的文字按钮） */
export interface PageRowAction<TRow> {
  label: string;
  icon?: Component;
  /** 按钮颜色，默认 primary */
  buttonType?: NaiveType;
  /** 权限标识，无权限时按钮不渲染 */
  auth?: string | string[];
  /** 行级显隐控制（如"内置参数不显示删除按钮"） */
  show?: (row: TRow) => boolean;
  /** 普通点击回调（与 confirm 二选一） */
  onClick?: (row: TRow) => void;
  /**
   * 二次确认文案。返回字符串则弹出确认框；
   * 返回 false 表示本次拦截（可在函数内自行 message.warning 提示原因）
   */
  confirm?: (row: TRow) => string | false;
  /** 确认后的执行逻辑。缺省时回退到 api.delete(row)，成功后自动刷新列表 */
  onConfirm?: (row: TRow) => unknown;
  /** 确认成功后的提示文案，默认"删除成功" */
  successText?: string;
}

/**
 * 工具栏回调的上下文。
 * 注意：不要在配置里直接引用 usePage 返回的 pageApi（会造成 TS 类型循环推导），
 * 勾选行等运行时状态统一通过这个入参拿
 */
export interface PageToolbarContext<TRow> {
  /** 多选列当前勾选的 row key */
  checkedRowKeys: Array<string | number>;
  /** 勾选 key 对应的行数据 */
  selection: TRow[];
}

/** 工具栏按钮（标题右侧一排实心按钮） */
export interface PageToolbarAction<TRow> {
  label: string;
  icon?: Component;
  /** 按钮颜色，默认 primary */
  buttonType?: NaiveType;
  auth?: string | string[];
  /** 禁用控制（如"批量删除"需要有选中行） */
  disabled?: (ctx: PageToolbarContext<TRow>) => boolean;
  onClick?: (ctx: PageToolbarContext<TRow>) => void;
  /** 二次确认文案，语义同 PageRowAction.confirm（用于清空日志、批量删除等） */
  confirm?: (ctx: PageToolbarContext<TRow>) => string | false;
  /** 确认后的执行逻辑，成功后自动回到第一页刷新 */
  onConfirm?: (ctx: PageToolbarContext<TRow>) => unknown;
  /** 确认成功后的提示文案，默认"操作成功" */
  successText?: string;
}

/**
 * 普通数据列：在 Naive UI 列定义基础上做了三点增强：
 * 1. title 收窄为纯文本，图标统一由 icon 字段渲染（内部走 RenderColumnTitle）
 * 2. auth：无权限时整列隐藏
 * 3. defaultVisible：接入"列设置"弹出层的默认显隐
 * 未声明 align/titleAlign 时默认居中，与现有页面风格一致
 */
export type PageDataColumn<TRow> = Omit<DataTableBaseColumn<TRow>, "title"> & {
  title: string;
  icon?: Component;
  auth?: string | string[];
  /** 列设置中的默认显隐，默认 true */
  defaultVisible?: boolean;
};

/** 序号列：自动按 (page - 1) * pageSize + index + 1 计算（无分页时为 index + 1） */
export interface PageIndexColumn {
  type: "index";
  title?: string;
  width?: number;
}

/** 多选列：勾选状态由 pageApi.checkedRowKeys 维护 */
export interface PageSelectionColumn {
  type: "selection";
  width?: number;
}

/** 操作列：自动渲染文字按钮组，内置权限过滤与二次确认 */
export interface PageActionsColumn<TRow> {
  type: "actions";
  title?: string;
  icon?: Component;
  width?: number;
  minWidth?: number;
  actions: PageRowAction<TRow>[];
}

export type PageColumn<TRow> = PageDataColumn<TRow> | PageIndexColumn | PageSelectionColumn | PageActionsColumn<TRow>;

/* -------------------------------------------------------------------------- */
/*                                  usePage 配置                               */
/* -------------------------------------------------------------------------- */

export interface UsePageOptions<TRow, TQuery extends object, TParams> {
  /** 页面标题（Page 布局左上角） */
  title?: string;
  /** 列显隐配置的 localStorage key，不传则不持久化 */
  columnStorageKey?: string;
  /** 接口定义 */
  api: PageApiOptions<TRow, TParams>;
  /**
   * 分页配置。false 表示无分页（配合返回数组的 list 接口，进入树形/全量模式）；
   * 对象形式可自定义 pageSize / pageSizes
   */
  pagination?: false | { pageSize?: number; pageSizes?: number[] };
  /** 搜索区配置，不传则不渲染搜索区 */
  search?: PageSearchOptions<TRow, TQuery, TParams>;
  /** 列定义 */
  columns: PageColumn<TRow>[];
  /** 工具栏：声明式按钮数组，或整块自定义渲染 */
  toolbar?: PageToolbarAction<TRow>[] | (() => VNodeChild);
  /**
   * 透传给 NDataTable 的额外 props（树形展开、rowProps、bordered 等），
   * 会覆盖内部默认值，是表格层的浅层逃生舱
   */
  table?: Partial<DataTableProps> & Record<string, unknown>;
  /**
   * 表格 max-height = 容器实测高度 - heightOffset。
   * 默认 100（给分页器留空间）；无分页的树形表可以调小（如 20）
   */
  heightOffset?: number;
  /** 表格空数据文案。函数形式可按状态动态变化（如"请先选择左侧字典类型"） */
  emptyDescription?: string | (() => string);
  /** 行 key 提取器，默认取 row.id */
  rowKey?: (row: TRow) => string | number;
  /** 生命周期钩子 */
  hooks?: {
    /** 数据加载成功后触发（如菜单页刷新侧边栏） */
    afterFetch?: (rows: TRow[]) => void | Promise<void>;
  };
  /** 组件挂载后是否立即查询，默认 true */
  immediate?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   PageApi                                  */
/* -------------------------------------------------------------------------- */

/**
 * usePage 返回的命令式 API。
 * 状态全部保存在 usePage 的闭包中（组件只是这份状态的"渲染器"），
 * 因此在组件挂载前调用这些方法也是安全的
 */
export interface PageApi<TRow, TQuery extends object> {
  /** 响应式查询模型，可直接读写（如 query.postName = "xx"） */
  query: TQuery;
  /** 表格加载状态（只读） */
  loading: Readonly<Ref<boolean>>;
  /** 当前表格数据（树形/全量模式下是过滤后的结果） */
  tableData: ComputedRef<TRow[]>;
  /** 多选列勾选的 row key 集合 */
  checkedRowKeys: Ref<Array<string | number>>;
  /** 保持当前页码刷新数据 */
  refresh: () => Promise<void>;
  /** 回到第一页并查询（搜索按钮的语义） */
  search: () => Promise<void>;
  /** 重置查询条件为默认值并查询 */
  reset: () => Promise<void>;
  /** 获取当前勾选的行数据（按 rowKey 从 tableData 中匹配） */
  getSelection: () => TRow[];
  /** 清空勾选 */
  clearSelection: () => void;
}

/** 内部使用：表格查询状态（modules/table-query.ts 的产物） */
export interface PageQueryState<TRow> {
  loading: Ref<boolean>;
  /** 接口返回的原始行数据（未经客户端过滤） */
  rawRows: Ref<TRow[]>;
  /** 展示用数据 */
  tableData: ComputedRef<TRow[]>;
  /** 是否分页模式 */
  paginated: boolean;
  /** Naive UI 分页对象（分页模式下有效） */
  pagination: PaginationProps & { page: number; pageSize: number; itemCount: number };
  checkedRowKeys: Ref<Array<string | number>>;
  refresh: () => Promise<void>;
  search: () => Promise<void>;
}
