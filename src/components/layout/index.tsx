import { useGlobalConfig } from "@/hooks";
import { defineComponent, type Ref, type SlotsType } from "vue";

export type LayoutSlotProps = {
  collapse: Ref<boolean>;
};

export default defineComponent({
  name: "Layout",
  props: {},
  slots: Object as SlotsType<{
    default?: () => unknown;
    title?: (props: LayoutSlotProps) => unknown;
    user?: (props: LayoutSlotProps) => unknown;
    menuTag?: (props: LayoutSlotProps) => unknown;
    menu?: (props: LayoutSlotProps) => unknown;
  }>,
  setup(_, { slots }) {
    const { collapse } = useGlobalConfig();

    return () => (
      <div class="size-full grid grid-cols-[auto_1fr] p-4 gap-2 bg-gray-200 dark:bg-black">
        {/* 菜单 */}
        <div
          class={[
            "rounded-lg h-full bg transition-all duration-300",
            collapse.value ? "w-16" : "w-60",
          ]}
        >
          {slots?.menu?.({ collapse })}
        </div>

        <div class="size-full overflow-hidden grid grid-rows-[auto_1fr] gap-2">
          {/* 顶部 */}
          <header class="px-4 py-1.5 rounded-md bg w-full flex flex-col gap-2">
            <div class="flex gap-4 w-full justify-between items-center ">
              <div class="min-w-0 flex-1">{slots.title?.({ collapse })}</div>
              {slots?.user?.({ collapse })}
            </div>
            {slots?.menuTag?.({ collapse })}
          </header>

          {/* 内容 */}
          <main class="size-full rounded-md overflow-clip">
            {slots.default?.()}
          </main>
        </div>
      </div>
    );
  },
});
