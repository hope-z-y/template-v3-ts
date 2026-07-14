import ArrowSync24Regular from "@vicons/fluent/es/ArrowSync24Regular";
import Grid24Regular from "@vicons/fluent/es/Grid24Regular";
import Search24Regular from "@vicons/fluent/es/Search24Regular";
import { NButton, NCheckbox, NFlex, NIcon, NPopover, NScrollbar, NTooltip } from "naive-ui";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
  type PropType,
  type SlotsType,
} from "vue";
import type { ColumnVisibilityOption } from "../modules/column-visibility";

/**
 * 页面布局壳（usePage 内部组件，不对外导出）。
 * 吸收自原 components/page：负责纯视图层的事情——
 * 搜索区显隐切换、标题栏、刷新按钮、列设置弹出层、表格区高度测量。
 * 数据与业务逻辑一概不管，全部通过 props / slots 从 usePage 注入。
 */
export default defineComponent({
  name: "PageWrapper",
  props: {
    title: {
      type: String,
      default: "",
    },
    /** 列设置弹出层的数据源，不传则不渲染"列设置"按钮 */
    columnOptions: {
      type: Array as PropType<ColumnVisibilityOption[]>,
      default: undefined,
    },
    /** 点击刷新按钮的回调，返回 Promise 时按钮自动进入 loading */
    onRefresh: {
      type: Function as PropType<() => Promise<void> | void>,
      required: true,
    },
    /** 列设置勾选变化回调 */
    onColumnVisibleChange: {
      type: Function as PropType<(key: string, visible: boolean) => void>,
      default: undefined,
    },
  },
  slots: Object as SlotsType<{
    /** 表格区，参数为容器实测高度，用于 NDataTable 的 max-height */
    default?: (maxHeight: number) => unknown;
    search?: () => unknown;
    toolbar?: () => unknown;
    footer?: () => unknown;
  }>,
  setup(props, { slots }) {
    const container = useTemplateRef<HTMLDivElement>("container");
    /** 表格容器的实际高度，通过 ResizeObserver 实时测量后传给默认插槽 */
    const maxHeight = ref(0);
    const columnPopoverVisible = ref(false);
    const searchVisible = ref(true);
    const refreshing = ref(false);

    const hasColumnOptions = computed(() => Boolean(props.columnOptions?.length));
    const hasSearchSlot = computed(() => Boolean(slots.search));

    const updateMaxHeight = () => {
      if (container.value) {
        maxHeight.value = container.value.clientHeight;
      }
    };

    let resizeObserver: ResizeObserver | undefined;

    onMounted(() => {
      nextTick(updateMaxHeight);

      if (container.value) {
        resizeObserver = new ResizeObserver(updateMaxHeight);
        resizeObserver.observe(container.value);
      }
    });

    onUnmounted(() => {
      resizeObserver?.disconnect();
    });

    // 搜索区折叠/展开会改变表格可用高度，等 DOM 更新后重新测量
    watch(searchVisible, () => {
      nextTick(() => {
        requestAnimationFrame(updateMaxHeight);
      });
    });

    const handleRefresh = async () => {
      if (refreshing.value) return;

      refreshing.value = true;
      try {
        await props.onRefresh();
      } finally {
        refreshing.value = false;
      }
    };

    const renderColumnPopover = () => (
      <div class="w-44 py-1">
        <div class="px-3 py-1.5 text-xs text-gray-500">列展示</div>
        <NScrollbar style={{ maxHeight: "240px" }}>
          <div class="flex flex-col gap-1 px-2 pb-1">
            {props.columnOptions?.map((column) => (
              <NCheckbox
                key={column.key}
                checked={column.visible}
                disabled={column.disabled}
                onUpdateChecked={(checked) => props.onColumnVisibleChange?.(column.key, checked)}
              >
                {column.title}
              </NCheckbox>
            ))}
          </div>
        </NScrollbar>
      </div>
    );

    const renderActionButtons = () => (
      <NFlex>
        {slots.toolbar?.()}
        <NTooltip trigger="hover">
          {{
            trigger: () => (
              <NButton circle tertiary type="primary" loading={refreshing.value} onClick={handleRefresh}>
                {{
                  icon: () => <NIcon component={ArrowSync24Regular} />,
                }}
              </NButton>
            ),
            default: () => "刷新",
          }}
        </NTooltip>
        {hasSearchSlot.value && (
          <NTooltip trigger="hover">
            {{
              trigger: () => (
                <NButton
                  circle
                  tertiary
                  type={searchVisible.value ? "primary" : "default"}
                  onClick={() => (searchVisible.value = !searchVisible.value)}
                >
                  {{
                    icon: () => <NIcon component={Search24Regular} />,
                  }}
                </NButton>
              ),
              default: () => (searchVisible.value ? "隐藏搜索" : "显示搜索"),
            }}
          </NTooltip>
        )}
        {hasColumnOptions.value && (
          <NPopover
            show={columnPopoverVisible.value}
            onUpdateShow={(value) => {
              columnPopoverVisible.value = value;
            }}
            trigger="click"
            placement="bottom-end"
            showArrow={false}
          >
            {{
              trigger: () => (
                <NTooltip trigger="hover">
                  {{
                    trigger: () => (
                      <NButton circle tertiary type={columnPopoverVisible.value ? "primary" : "default"}>
                        {{
                          icon: () => <NIcon component={Grid24Regular} />,
                        }}
                      </NButton>
                    ),
                    default: () => "列设置",
                  }}
                </NTooltip>
              ),
              default: renderColumnPopover,
            }}
          </NPopover>
        )}
      </NFlex>
    );

    return () => (
      <div class="flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden">
        {hasSearchSlot.value && (
          <header v-show={searchVisible.value} class="shrink-0">
            {slots.search?.()}
          </header>
        )}
        <main class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div class="flex w-full shrink-0 items-center justify-between gap-3 overflow-hidden py-1.5">
            {props.title && <div class="min-w-0 text-lg font-bold">{props.title}</div>}
            <div class="ml-auto rounded-full">{renderActionButtons()}</div>
          </div>

          <div class="min-h-0 flex-1 overflow-hidden" ref="container">
            {slots.default?.(maxHeight.value)}
          </div>
        </main>

        {slots.footer && <footer class="shrink-0">{slots.footer?.()}</footer>}
      </div>
    );
  },
});
