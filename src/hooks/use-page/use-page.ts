import { useUserStore } from "@/stores";
import { NDataTable, NEmpty } from "naive-ui";
import { computed, defineComponent, h, onMounted, reactive, type SlotsType } from "vue";
import PageWrapper from "./components/page-wrapper";
import SearchForm from "./components/search-form";
import { renderToolbar } from "./components/toolbar";
import { createColumnVisibility } from "./modules/column-visibility";
import { buildColumns, buildColumnVisibilityDefaults } from "./modules/columns";
import { createDeleteConfirm } from "./modules/delete-confirm";
import { createTableQuery } from "./modules/table-query";
import type { PageApi, SearchFieldSchema, UsePageOptions } from "./types";

/**
 * usePage：vben useVbenVxeGrid 风格的列表页一站式 hook。
 *
 * ```ts
 * const [Page, pageApi] = usePage<IPostRow, PostQuery>({ ... });
 * ```
 *
 * 设计要点：
 * 1. 所有状态（查询模型、表格数据、分页、勾选、列显隐）都创建在本函数的【闭包】里，
 *    返回的 Page 组件只是这份状态的"渲染器"。因此：
 *    - pageApi 在组件挂载前就可以安全调用（比如在 watch 里改 query）
 *    - 同一页面调用两次 usePage 得到两套完全独立的实例（字典管理的双表就是这么用的）
 * 2. usePage 必须在组件 setup 中调用（内部用到了 useDialog / useMessage / pinia）。
 * 3. 逃生舱分三级：
 *    - 字段级：schema 项的 render、列定义的 render
 *    - 区块级：Page 组件的 search / toolbar / table / footer 插槽整块覆盖
 *    - 数据级：api.list 是普通异步函数，任意复杂的取数逻辑都可以在外面适配好再传入
 */
export const usePage = <TRow, TQuery extends object, TParams = Record<string, unknown>>(
  options: UsePageOptions<TRow, TQuery, TParams>,
) => {
  const userStore = useUserStore();
  const deleteConfirm = createDeleteConfirm();

  /* ------------------------------ 闭包状态区 ------------------------------ */

  // 响应式查询模型：搜索表单直接读写它，pageApi.query 也是它，天然同一份数据
  const query = reactive(options.search?.defaults() ?? {}) as TQuery;

  // 表格查询状态机（loading / 数据 / 分页 / 勾选）
  const queryState = createTableQuery<TRow, TQuery, TParams>(options, query);

  // 列显隐：默认配置从列定义推导，storageKey 存在时持久化用户选择
  const columnVisibility = createColumnVisibility(
    buildColumnVisibilityDefaults(options.columns),
    options.columnStorageKey,
  );

  const rowKey = options.rowKey ?? ((row: TRow) => (row as { id: string | number }).id);

  /* ------------------------------- PageApi ------------------------------- */

  const api: PageApi<TRow, TQuery> = {
    query,
    loading: queryState.loading,
    tableData: queryState.tableData,
    checkedRowKeys: queryState.checkedRowKeys,
    refresh: queryState.refresh,
    search: queryState.search,
    // 重置 = 查询模型回到默认值 + 回第一页查询。
    // Object.assign 要求 defaults() 枚举全部字段，否则残留旧值
    reset: () => {
      Object.assign(query, options.search?.defaults() ?? {});
      return queryState.search();
    },
    // 勾选的 key -> 行数据。按当前展示数据匹配（跨页勾选不保留，与刷新清空勾选的策略一致）
    getSelection: () => {
      const keys = new Set(queryState.checkedRowKeys.value);
      return queryState.tableData.value.filter((row) => keys.has(rowKey(row)));
    },
    clearSelection: () => {
      queryState.checkedRowKeys.value = [];
    },
  };

  /* ------------------------------ 渲染准备区 ------------------------------ */

  const hasPermission = (value: string | string[]) => userStore.hasPermission(value);

  /** 行操作的二次确认执行器：确认 -> 执行 -> 提示 -> 保持当前页刷新 */
  const confirmRowAction = (opts: { content: string; successText?: string; onConfirm: () => Promise<void> | void }) => {
    deleteConfirm.confirm({
      content: opts.content,
      successText: opts.successText,
      onConfirm: opts.onConfirm,
      onSuccess: queryState.refresh,
    });
  };

  /** 工具栏的二次确认执行器：清空 / 批量删除后数据量剧变，成功后回到第一页 */
  const confirmToolbarAction = (opts: {
    content: string;
    successText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    deleteConfirm.confirm({
      content: opts.content,
      successText: opts.successText,
      onConfirm: opts.onConfirm,
      onSuccess: queryState.search,
    });
  };

  /** 最终列定义：依赖列显隐 / 分页状态 / 权限，任何一项变化都重新编译 */
  const builtColumns = computed(() =>
    buildColumns(options.columns, {
      hasPermission,
      getPageOffset: () =>
        queryState.paginated ? (queryState.pagination.page - 1) * queryState.pagination.pageSize : 0,
      visibleKeys: columnVisibility.visibleKeys.value,
      confirmAction: confirmRowAction,
      defaultDelete: options.api.delete
        ? async (row: TRow) => {
            await options.api.delete!(row);
          }
        : undefined,
    }),
  );

  /* ------------------------------ Page 组件 ------------------------------ */

  const Page = defineComponent({
    name: "UsePageRenderer",
    slots: Object as SlotsType<{
      /** 整块覆盖搜索区（优先级高于 search.schema / search.render 配置） */
      search?: () => unknown;
      /** 整块覆盖工具栏（优先级高于 toolbar 配置） */
      toolbar?: () => unknown;
      /** 整块覆盖表格区，参数为容器实测高度 */
      table?: (maxHeight: number) => unknown;
      footer?: () => unknown;
    }>,
    setup(_props, { slots }) {
      onMounted(() => {
        if (options.immediate !== false) {
          queryState.refresh();
        }
      });

      /** 搜索区：插槽 > search.render > schema，都没有则不渲染 */
      const renderSearch = () => {
        if (slots.search) return slots.search();
        if (!options.search) return undefined;
        if (options.search.render) return options.search.render();
        if (!options.search.schema?.length) return undefined;

        return h(SearchForm, {
          model: query as Record<string, unknown>,
          schema: options.search.schema as SearchFieldSchema<Record<string, unknown>>[],
          columns: options.search.columns ?? 4,
          onSearch: api.search,
          onReset: api.reset,
          // 控件输入直接写回闭包里的查询模型（query 与 pageApi.query 是同一份）
          onUpdateField: (field, value) => {
            (query as Record<string, unknown>)[field] = value;
          },
        });
      };

      /** 工具栏：插槽 > 自定义渲染函数 > 声明式按钮数组 */
      const renderToolbarArea = () => {
        if (slots.toolbar) return slots.toolbar();
        if (!options.toolbar) return undefined;
        if (typeof options.toolbar === "function") return options.toolbar();
        return renderToolbar(options.toolbar, {
          hasPermission,
          confirmAction: confirmToolbarAction,
          getToolbarContext: () => ({
            checkedRowKeys: queryState.checkedRowKeys.value,
            selection: api.getSelection(),
          }),
        });
      };

      /** 自定义空数据文案（NDataTable 的 empty 插槽） */
      const renderEmpty = () => {
        if (!options.emptyDescription) return undefined;
        const description =
          typeof options.emptyDescription === "function" ? options.emptyDescription() : options.emptyDescription;
        return h(NEmpty, { description });
      };

      /** 表格区：插槽整块覆盖，否则渲染内置 NDataTable */
      const renderTable = (maxHeight: number) => {
        if (slots.table) return slots.table(maxHeight);

        const emptyContent = options.emptyDescription ? { empty: renderEmpty } : undefined;

        return h(
          NDataTable,
          {
            columns: builtColumns.value,
            data: queryState.tableData.value as Array<Record<string, unknown>>,
            loading: queryState.loading.value,
            rowKey: rowKey as (row: Record<string, unknown>) => string | number,
            checkedRowKeys: queryState.checkedRowKeys.value,
            onUpdateCheckedRowKeys: (keys: Array<string | number>) => {
              queryState.checkedRowKeys.value = keys;
            },
            // 分页模式：remote + 受控 pagination；全量模式：不渲染分页器
            ...(queryState.paginated ? { remote: true, pagination: queryState.pagination } : {}),
            bottomBordered: false,
            scrollX: "fit-content",
            maxHeight: maxHeight - (options.heightOffset ?? 100),
            striped: true,
            resizable: true,
            // 页面级透传（treeProps / rowProps / bordered 等）放最后，可覆盖以上默认值
            ...options.table,
          },
          emptyContent,
        );
      };

      return () => {
        const searchContent = renderSearch();
        const toolbarContent = renderToolbarArea();

        return h(
          PageWrapper,
          {
            title: options.title ?? "",
            columnOptions: columnVisibility.columnOptions.value,
            onRefresh: queryState.refresh,
            onColumnVisibleChange: columnVisibility.setVisible,
          },
          {
            search: searchContent ? () => searchContent : undefined,
            toolbar: toolbarContent ? () => toolbarContent : undefined,
            default: (maxHeight: number) => renderTable(maxHeight),
            footer: slots.footer,
          },
        );
      };
    },
  });

  return [Page, api] as const;
};
