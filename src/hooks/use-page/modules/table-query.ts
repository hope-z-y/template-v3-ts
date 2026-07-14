import { computed, reactive, ref, type Ref } from "vue";
import type { PageQueryState, UsePageOptions } from "../types";

/**
 * 默认查询参数构建规则（分页模式）：
 * - 字符串 trim 后非空才携带
 * - null / undefined 直接丢弃
 * - 其余值（数字、布尔、数组等）原样携带
 * - 自动附加 pageNum / pageSize
 *
 * 覆盖不了的场景（字段改名、格式转换等）请通过 search.buildParams 自定义。
 */
const defaultBuildParams = <TQuery extends object>(query: TQuery, page: number, pageSize: number) => {
  const params: Record<string, unknown> = { pageNum: page, pageSize };

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) params[key] = trimmed;
      return;
    }

    params[key] = value;
  });

  return params;
};

/**
 * 表格查询状态机：吸收原 useTableQuery，并扩展"树形/全量模式"。
 *
 * 两种模式的判定依据是 options.pagination：
 * - 分页模式（默认）：list 接口返回 { rows, total }，翻页/搜索都重新请求服务端
 * - 全量模式（pagination: false）：list 接口一次性返回数组（如部门树、菜单树），
 *   搜索不再请求服务端，而是用 clientFilter 在内存中过滤（query 是响应式的，输入即联动）
 */
export const createTableQuery = <TRow, TQuery extends object, TParams>(
  options: UsePageOptions<TRow, TQuery, TParams>,
  query: TQuery,
): PageQueryState<TRow> => {
  const paginated = options.pagination !== false;

  const loading = ref(false);
  const rawRows = ref<TRow[]>([]) as Ref<TRow[]>;
  const checkedRowKeys = ref<Array<string | number>>([]);

  // Naive UI 的 pagination 需要保持同一个 reactive 对象引用，才能被表格正确追踪
  const pagination = reactive({
    page: 1,
    pageSize: (options.pagination !== false && options.pagination?.pageSize) || 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: (options.pagination !== false && options.pagination?.pageSizes) || [10, 20, 50, 100],
    prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
    onChange: (page: number) => {
      pagination.page = page;
      refresh();
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;
      refresh();
    },
  });

  /**
   * 展示数据：
   * - 分页模式：直接展示接口返回的 rows
   * - 全量模式：先经过 clientFilter（若配置）再展示，过滤是纯前端计算
   */
  const tableData = computed(() => {
    if (paginated || !options.search?.clientFilter) return rawRows.value;
    return options.search.clientFilter(rawRows.value, query);
  });

  /** 构建本次请求参数。全量模式的 list 接口通常无参，传什么它都不关心 */
  const buildParams = (): TParams => {
    if (options.search?.buildParams) {
      return options.search.buildParams(query, pagination.page, pagination.pageSize);
    }
    return defaultBuildParams(query, pagination.page, pagination.pageSize) as TParams;
  };

  const refresh = async () => {
    try {
      loading.value = true;
      const result = await options.api.list(buildParams());

      // 兼容两种返回形态：数组（全量） / { rows, total }（分页）
      if (Array.isArray(result)) {
        rawRows.value = result;
        pagination.itemCount = result.length;
      } else {
        rawRows.value = result.rows;
        pagination.itemCount = result.total;
      }

      // 数据刷新后旧的勾选行可能已不存在，统一清空避免"幽灵选中"
      checkedRowKeys.value = [];

      await options.hooks?.afterFetch?.(rawRows.value);
    } finally {
      loading.value = false;
    }
  };

  /** 搜索语义：回到第一页再请求（全量模式下页码无意义，等价于刷新） */
  const search = () => {
    pagination.page = 1;
    return refresh();
  };

  return {
    loading,
    rawRows,
    tableData,
    paginated,
    pagination,
    checkedRowKeys,
    refresh,
    search,
  };
};
