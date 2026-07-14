import { NTag, type TagProps } from "naive-ui";
import { computed, defineComponent, h, inject, type PropType } from "vue";
import { DICT_API_KEY, type DictValue } from "./types";

const tagTypeMap: Readonly<Record<string, NonNullable<TagProps["type"]>>> = {
  default: "default",
  primary: "primary",
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
  danger: "error",
};

const getTagType = (listClass: string | null | undefined): NonNullable<TagProps["type"]> => {
  return tagTypeMap[listClass?.trim().toLowerCase() ?? ""] ?? "default";
};

export const DictTag = defineComponent({
  name: "DictTag",
  inheritAttrs: false,
  props: {
    dictType: {
      type: String,
      required: true,
    },
    value: {
      type: null as unknown as PropType<DictValue>,
      required: true,
    },
    fallback: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const dictApi = inject(DICT_API_KEY);

    if (!dictApi) {
      throw new Error("DictTag must be used with the component returned by useDict().");
    }

    const item = computed(() => dictApi.getDictItem(props.dictType, props.value));
    const label = computed(() => dictApi.getDictLabel(props.dictType, props.value, props.fallback));
    const type = computed(() => getTagType(item.value?.listClass));

    return () =>
      h(
        NTag,
        {
          ...attrs,
          class: [attrs.class, item.value?.cssClass],
          size: (attrs.size as TagProps["size"] | undefined) ?? "small",
          type: type.value,
        },
        { default: () => label.value },
      );
  },
});
