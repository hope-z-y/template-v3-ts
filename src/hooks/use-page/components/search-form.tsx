import ArrowReset24Regular from "@vicons/fluent/es/ArrowReset24Regular";
import ChevronDown24Regular from "@vicons/fluent/es/ChevronDown24Regular";
import ChevronUp24Regular from "@vicons/fluent/es/ChevronUp24Regular";
import Search24Regular from "@vicons/fluent/es/Search24Regular";
import { useElementSize } from "@vueuse/core";
import { NButton, NDatePicker, NForm, NFormItem, NIcon, NInput, NInputNumber, NSelect, NTreeSelect } from "naive-ui";
import { computed, defineComponent, ref, type PropType, type VNodeChild } from "vue";
import type { SearchFieldSchema } from "../types";
import { calculateSearchColumns } from "../modules/search-layout";

/**
 * schema 驱动的搜索表单（usePage 内部组件）。
 * 吸收自原 components/search-form，从"插槽塞 NFormItem"改为"schema 声明"：
 * 每个字段描述控件类型和 props，组件负责渲染控件并把值双向绑定到查询模型上。
 *
 * 查询模型（model）是 usePage 闭包里的 reactive 对象，这里直接原地读写它的字段，
 * 因此 pageApi.query 和搜索表单天然是同一份数据。
 */
export default defineComponent({
  name: "PageSearchForm",
  props: {
    /** 响应式查询模型（pageApi.query） */
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    schema: {
      type: Array as PropType<SearchFieldSchema<Record<string, unknown>>[]>,
      required: true,
    },
    /** 每行的最大表单项列数，实际列数会根据容器宽度自动调整 */
    columns: {
      type: Number,
      default: 4,
    },
    onSearch: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onReset: {
      type: Function as PropType<() => void>,
      required: true,
    },
    /** 字段更新回调：由 usePage 注入，写回闭包里的查询模型（避免直接改 prop） */
    onUpdateField: {
      type: Function as PropType<(field: string, value: unknown) => void>,
      required: true,
    },
  },
  setup(props) {
    const layoutRef = ref<HTMLElement | null>(null);
    const { width: layoutWidth } = useElementSize(layoutRef);

    const maxColumns = computed(() => Math.max(1, Math.floor(props.columns)));

    /** 当前容器实际能容纳的列数，按钮宽度始终预留，表单项随内容区收窄自动降列。 */
    const responsiveColumns = computed(() => {
      return calculateSearchColumns(layoutWidth.value, maxColumns.value, props.schema.length);
    });

    /** 字段数超过一行时支持折叠，默认只显示第一行 */
    const expanded = ref(false);
    const needCollapse = computed(() => props.schema.length > responsiveColumns.value);

    const isFieldVisible = (index: number) => {
      if (!needCollapse.value || expanded.value) return true;
      return index < responsiveColumns.value;
    };

    /** 解析 schema 里的动态 props（函数形式用于依赖异步数据的场景，如部门树 options） */
    const resolveExtraProps = (item: SearchFieldSchema<Record<string, unknown>>) => {
      return typeof item.props === "function" ? item.props() : (item.props ?? {});
    };

    /**
     * 按 component 白名单渲染控件。
     * 所有控件统一：clearable + 双向绑定 model[field] + disabled 联动。
     * 白名单外的需求走 item.render 字段级逃生舱。
     */
    const renderField = (item: SearchFieldSchema<Record<string, unknown>>): VNodeChild => {
      if (item.render) return item.render();

      const disabled = item.disabled?.() ?? false;
      const extraProps = resolveExtraProps(item);
      // undefined 会被 Naive UI 控件当作"非受控"，重置后输入框不会清空；归一为 null 保持受控
      const value = props.model[item.field] ?? null;
      const onUpdate = (next: unknown) => {
        props.onUpdateField(item.field, next);
      };

      switch (item.component ?? "input") {
        case "input":
          return (
            <NInput
              value={value as string | null}
              onUpdateValue={onUpdate}
              placeholder={item.placeholder ?? `请输入${item.label}`}
              clearable
              disabled={disabled}
              {...extraProps}
            />
          );
        case "input-number":
          return (
            <NInputNumber
              value={value as number | null}
              onUpdateValue={onUpdate}
              placeholder={item.placeholder ?? `请输入${item.label}`}
              clearable
              disabled={disabled}
              class="w-full"
              {...extraProps}
            />
          );
        case "select":
          return (
            <NSelect
              value={value as string | number | null}
              onUpdateValue={onUpdate}
              placeholder={item.placeholder ?? `请选择${item.label}`}
              clearable
              disabled={disabled}
              class="w-full min-w-[160px]"
              {...extraProps}
            />
          );
        case "tree-select":
          return (
            <NTreeSelect
              value={value as string | number | null}
              onUpdateValue={onUpdate}
              placeholder={item.placeholder ?? `请选择${item.label}`}
              clearable
              disabled={disabled}
              class="w-full min-w-[160px]"
              {...extraProps}
            />
          );
        case "date-range":
          return (
            <NDatePicker
              value={value as [number, number] | null}
              onUpdateValue={onUpdate}
              type="daterange"
              clearable
              disabled={disabled}
              class="w-full"
              {...extraProps}
            />
          );
      }
    };

    return () => (
      <div class="bg p-2 search-form">
        <NForm model={props.model} labelPlacement="left" labelWidth="auto">
          <div ref={layoutRef} class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            {/* 搜索项网格：默认最多三列，并根据当前内容容器宽度自动降列。 */}
            <div
              class="search-form-fields min-w-0 flex-1 grid items-start gap-2"
              style={{ "--search-form-columns": responsiveColumns.value }}
            >
              {props.schema.map((item, index) => (
                <div v-show={isFieldVisible(index)} class="min-w-0" key={item.field}>
                  <NFormItem label={item.label} path={item.field}>
                    {renderField(item)}
                  </NFormItem>
                </div>
              ))}
            </div>

            <div class="flex shrink-0 flex-nowrap items-center justify-end gap-2 self-start whitespace-nowrap">
              <NButton type="primary" onClick={props.onSearch}>
                {{
                  icon: () => <NIcon component={Search24Regular} />,
                  default: () => "搜索",
                }}
              </NButton>
              <NButton onClick={props.onReset}>
                {{
                  icon: () => <NIcon component={ArrowReset24Regular} />,
                  default: () => "重置",
                }}
              </NButton>
              {needCollapse.value && (
                <NButton text type="primary" onClick={() => (expanded.value = !expanded.value)}>
                  {{
                    icon: () => <NIcon>{expanded.value ? <ChevronUp24Regular /> : <ChevronDown24Regular />}</NIcon>,
                    default: () => (expanded.value ? "折叠" : "展开"),
                  }}
                </NButton>
              )}
            </div>
          </div>
        </NForm>
      </div>
    );
  },
});
