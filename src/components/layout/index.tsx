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
    const { collapse, density } = useGlobalConfig();

    return () => (
      <div
        class={[
          "size-full grid grid-cols-[auto_minmax(0,1fr)] bg-gray-200 dark:bg-black",
          density.value === "compact" ? "gap-1 p-2" : "gap-2 p-4",
        ]}
      >
        {/* 菜单 */}
        <div class={["rounded-lg h-full bg transition-all duration-300", collapse.value ? "w-16" : "w-60"]}>
          {slots?.menu?.({ collapse })}
        </div>

        <div class="size-full min-h-0 min-w-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)] gap-2">
          {/* 顶部 */}
          <header
            class={[
              "rounded-md bg w-full min-w-0 overflow-hidden flex flex-col",
              density.value === "compact" ? "gap-1 px-3 py-1" : "gap-2 px-4 py-1.5",
            ]}
          >
            <div class="flex gap-4 w-full min-w-0 justify-between items-center overflow-hidden">
              <div class="min-w-0 flex-1">{slots.title?.({ collapse })}</div>
              {slots?.user?.({ collapse })}
            </div>
            <div class="w-full min-w-0 max-w-full overflow-hidden">{slots?.menuTag?.({ collapse })}</div>
          </header>

          {/* 内容 */}
          <main class="size-full min-h-0 overflow-hidden rounded-md">{slots.default?.()}</main>
        </div>
      </div>
    );
  },
});
