import { defineComponent } from "vue";
import "./index.css";

const text = "Loading";

export default defineComponent({
  name: "Loading",
  setup() {
    const loadingText = text.split("");

    return () => (
      <div class="relative flex select-none items-center justify-center gap-2.5 text-white">
        <div class="loader z-0 size-5 shrink-0 rounded-full bg-transparent" />
        <div class="flex gap-px">
          {loadingText.map((item, index) => (
            <span
              key={index}
              class="loader-letter z-1 inline-block rounded-[50ch] border-none opacity-40"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  },
});
