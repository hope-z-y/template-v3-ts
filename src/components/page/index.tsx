import ArrowSync24Regular from "@vicons/fluent/es/ArrowSync24Regular";
import Grid24Regular from "@vicons/fluent/es/Grid24Regular";
import Search24Regular from "@vicons/fluent/es/Search24Regular";
import { NButton, NCheckbox, NFlex, NIcon, NPopover, NScrollbar, NTooltip } from "naive-ui";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
  type PropType,
  type SlotsType,
} from "vue";

export interface PageColumnOption {
  key: string;
  title: string;
  visible: boolean;
  /** 不可取消显示的列（如操作列、多选列） */
  disabled?: boolean;
}

const Page = defineComponent({
  name: "PageWrapper",
  props: {
    /** Title */
    title: {
      type: String,
      required: false,
      default: "",
    },
    /** 表格列显隐配置，配合 v-model:column-options 使用 */
    columnOptions: {
      type: Array as PropType<PageColumnOption[]>,
      default: undefined,
    },
    /** 是否显示搜索区域，配合 v-model:show-search 使用 */
    showSearch: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: ["refresh", "update:columnOptions", "update:showSearch"],
  slots: Object as SlotsType<{
    default?: (maxHeight: number) => unknown;
    title?: () => unknown;
    search?: () => unknown;
    toolbar?: () => unknown;
    footer?: () => unknown;
  }>,
  setup(props, { slots, emit }) {
    const instance = getCurrentInstance();
    const container = useTemplateRef<HTMLDivElement>("container");
    const maxHeight = ref(0);
    const columnPopoverVisible = ref(false);
    const internalShowSearch = ref(true);
    const refreshing = ref(false);

    const searchVisible = computed({
      get: () => props.showSearch ?? internalShowSearch.value,
      set: (value: boolean) => {
        internalShowSearch.value = value;
        emit("update:showSearch", value);
      },
    });

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

    watch(searchVisible, () => {
      nextTick(() => {
        requestAnimationFrame(updateMaxHeight);
      });
    });

    const toggleSearchVisible = () => {
      searchVisible.value = !searchVisible.value;
    };

    const handleRefresh = async () => {
      if (refreshing.value) return;

      refreshing.value = true;
      try {
        const handler = instance?.vnode.props?.onRefresh;
        if (Array.isArray(handler)) {
          await Promise.all(handler.map((item) => item()));
        } else if (typeof handler === "function") {
          await handler();
        } else {
          emit("refresh");
        }
      } finally {
        refreshing.value = false;
      }
    };

    const handleColumnVisibleChange = (key: string, visible: boolean) => {
      if (!props.columnOptions) return;

      emit(
        "update:columnOptions",
        props.columnOptions.map((column) => (column.key === key ? { ...column, visible } : column)),
      );
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
                onUpdateChecked={(checked) => handleColumnVisibleChange(column.key, checked)}
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
                  onClick={toggleSearchVisible}
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
            {(slots.title || props.title) && (
              <div class="min-w-0 text-lg font-bold">{slots.title ? slots.title() : props.title}</div>
            )}
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

export default Page;
