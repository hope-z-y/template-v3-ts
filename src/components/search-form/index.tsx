import ArrowReset24Regular from "@vicons/fluent/es/ArrowReset24Regular";
import ChevronDown24Regular from "@vicons/fluent/es/ChevronDown24Regular";
import ChevronUp24Regular from "@vicons/fluent/es/ChevronUp24Regular";
import Search24Regular from "@vicons/fluent/es/Search24Regular";
import { NButton, NForm, NIcon } from "naive-ui";
import { Comment, Fragment, Text, computed, defineComponent, ref, type VNode } from "vue";

function flattenVNodes(vnodes: VNode[]): VNode[] {
  const result: VNode[] = [];

  vnodes.forEach((vnode) => {
    if (vnode.type === Fragment && Array.isArray(vnode.children)) {
      result.push(...flattenVNodes(vnode.children as VNode[]));
      return;
    }

    if (vnode.type === Comment || vnode.type === Text || typeof vnode.type === "symbol") {
      return;
    }

    result.push(vnode);
  });

  return result;
}

export default defineComponent({
  name: "SearchForm",
  props: {
    /** 每行显示的表单项列数 */
    columns: {
      type: Number,
      default: 3,
    },
    /** 表单数据，传给 NForm */
    model: {
      type: Object as () => Record<string, unknown>,
      default: undefined,
    },
  },
  emits: ["search", "reset"],
  setup(props, { slots, emit }) {
    const expanded = ref(false);

    const fields = computed(() => flattenVNodes(slots.default?.() ?? []));
    const needCollapse = computed(() => fields.value.length > props.columns);

    const isFieldVisible = (index: number) => {
      if (!needCollapse.value || expanded.value) {
        return true;
      }

      return index < props.columns;
    };

    return () => (
      <div class="bg p-2 search-form">
        <NForm model={props.model} labelPlacement="left" labelWidth="auto">
          <div class="flex w-full items-start gap-2">
            {/* 左侧：仅放表单项，按 columns 列网格换行 */}
            <div
              class="search-form-fields min-w-0 flex-1 grid items-start gap-2"
              style={{ "--search-form-columns": props.columns }}
            >
              {fields.value.map((field, index) => (
                <div v-show={isFieldVisible(index)} class="min-w-0" key={index}>
                  {field}
                </div>
              ))}
            </div>

            {/* 右侧：操作按钮独占一列，下方不再放置表单项 */}
            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 self-start">
              <NButton type="primary" onClick={() => emit("search")}>
                {{
                  icon: () => <NIcon component={Search24Regular} />,
                  default: () => "搜索",
                }}
              </NButton>
              <NButton onClick={() => emit("reset")}>
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
