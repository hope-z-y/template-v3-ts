import { useUserStore } from "@/stores";
import { computed, defineComponent, type PropType } from "vue";

/**
 * 权限组件适合包裹一整块内容：
 * <Permission value="system:user:add"><NButton>新增</NButton></Permission>
 *
 * 如果只是控制单个按钮，也可以使用 v-permission 指令。
 */
export default defineComponent({
  name: "Permission",
  props: {
    /** 支持单个权限标识，或多个权限标识。多个权限默认满足任意一个即可显示。 */
    value: {
      type: [String, Array] as PropType<string | string[]>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const userStore = useUserStore();
    const visible = computed(() => userStore.hasPermission(props.value));

    // 没有权限时不渲染默认插槽，页面上不会留下无意义的空节点。
    return () => (visible.value ? slots.default?.() : null);
  },
});
