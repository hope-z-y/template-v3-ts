import { computed, reactive, ref, watch, type Ref } from "vue";
import { useDialog, useMessage } from "naive-ui";
import type { PageColumnOption } from "@/components";

type CrudMode = "create" | "edit";

/**
 * 新增/编辑弹窗的通用状态。
 * 页面只需要关心 openCreate、openEdit 和 close，弹窗模式与当前记录都由这里维护。
 */
export const useCrudDialog = <TRecord>() => {
  const visible = ref(false);
  const mode = ref<CrudMode>("create");
  const record = ref<TRecord | null>(null) as Ref<TRecord | null>;

  const openCreate = () => {
    mode.value = "create";
    record.value = null;
    visible.value = true;
  };

  const openEdit = (item: TRecord) => {
    mode.value = "edit";
    record.value = item;
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
  };

  return {
    visible,
    mode,
    record,
    openCreate,
    openEdit,
    close,
  };
};

/**
 * 表格列显隐配置。
 * storageKey 传入后会把用户选择保存到 localStorage，刷新页面后仍能恢复。
 */
export const useColumnVisibility = (defaults: PageColumnOption[], storageKey?: string) => {
  const readStored = () => {
    if (!storageKey || typeof window === "undefined") return defaults;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return defaults;

      const visibleMap = new Map(
        (JSON.parse(raw) as Array<Pick<PageColumnOption, "key" | "visible">>).map((item) => [item.key, item.visible]),
      );

      return defaults.map((item) => ({
        ...item,
        visible: item.disabled ? true : (visibleMap.get(item.key) ?? item.visible),
      }));
    } catch {
      return defaults;
    }
  };

  const columnOptions = ref<PageColumnOption[]>(readStored());
  const visibleKeys = computed(
    () => new Set(columnOptions.value.filter((item) => item.visible).map((item) => item.key)),
  );

  // 监听列配置变化，自动持久化用户的显隐选择。
  watch(
    columnOptions,
    (value) => {
      if (!storageKey || typeof window === "undefined") return;
      window.localStorage.setItem(storageKey, JSON.stringify(value.map(({ key, visible }) => ({ key, visible }))));
    },
    { deep: true },
  );

  return {
    columnOptions,
    visibleKeys,
  };
};

/**
 * 删除确认弹窗。
 * onDelete 负责真正调用接口，onSuccess 负责删除成功后的刷新列表等后续动作。
 */
export const useDeleteConfirm = () => {
  const dialog = useDialog();
  const message = useMessage();

  const confirmDelete = (options: {
    title?: string;
    content: string;
    successText?: string;
    onDelete: () => Promise<void>;
    onSuccess?: () => Promise<void> | void;
  }) => {
    dialog.error({
      title: options.title ?? "确认删除",
      content: options.content,
      positiveText: "确定",
      negativeText: "取消",
      onPositiveClick: async () => {
        await options.onDelete();
        message.success(options.successText ?? "删除成功");
        await options.onSuccess?.();
      },
    });
  };

  return {
    confirmDelete,
  };
};

/**
 * 列表分页查询的通用逻辑。
 * fetcher 负责请求接口，buildParams 负责把当前页码和 pageSize 拼成业务接口参数。
 */
export const useTableQuery = <TRow, TParams>(options: {
  pageSize?: number;
  pageSizes?: number[];
  fetcher: (params: TParams) => Promise<{ rows: TRow[]; total: number }>;
  buildParams: (page: number, pageSize: number) => TParams;
}) => {
  const loading = ref(false);
  const tableData = ref<TRow[]>([]) as Ref<TRow[]>;

  // Naive UI pagination 对象需要保持响应式，因此这里用 reactive。
  const pagination = reactive({
    page: 1,
    pageSize: options.pageSize ?? 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: options.pageSizes ?? [10, 20, 50, 100],
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

  const refresh = async () => {
    try {
      loading.value = true;
      const { rows, total } = await options.fetcher(options.buildParams(pagination.page, pagination.pageSize));
      tableData.value = rows;
      pagination.itemCount = total;
    } finally {
      loading.value = false;
    }
  };

  // 搜索时通常回到第一页，再按最新查询条件拉取数据。
  const search = () => {
    pagination.page = 1;
    return refresh();
  };

  return {
    loading,
    tableData,
    pagination,
    refresh,
    search,
  };
};
