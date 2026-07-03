import { defineComponent, type SlotsType } from "vue";
import { NButton, NIcon, NFlex } from "naive-ui";
import { ArrowSync24Regular, Search24Regular, Grid24Regular } from "@vicons/fluent";

const Page = defineComponent({
  name: "PageWrapper",
  props: {
    /** Title */
    title: {
      type: String,
      required: false,
    },
  },
  slots: Object as SlotsType<{
    default?: () => unknown;
    title?: () => unknown;
    search?: () => unknown;
    toolbar?: () => unknown;
    footer?: () => unknown;
  }>,
  setup(props, { slots }) {
    return () => (
      <div class="grid h-full max-h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
        {slots?.search && <header>{slots.search?.()}</header>}
        <main class="min-h-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]">
          <div v-if="$slots.title && $slots.toolbar" class="py-1.5 flex justify-between items-center">
            <div class="text-lg font-bold">{slots.title ? slots.title : props.title}</div>
            <div class="rounded-full">
              <NFlex>
                {slots.toolbar?.()}
                <NButton circle tertiary type="primary">
                  {{
                    icon: () => <NIcon component={ArrowSync24Regular} />,
                  }}
                </NButton>
                <NButton circle tertiary type="primary">
                  {{
                    icon: () => <NIcon component={Search24Regular} />,
                  }}
                </NButton>
                <NButton circle tertiary type="primary">
                  {{
                    icon: () => <NIcon component={Grid24Regular} />,
                  }}
                </NButton>
              </NFlex>
            </div>
          </div>
          {slots.default?.()}
        </main>

        {slots.footer && <footer>{slots.footer?.()}</footer>}
      </div>
    );
  },
});

export default Page;
