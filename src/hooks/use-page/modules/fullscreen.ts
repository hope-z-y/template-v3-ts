import { useFullscreen } from "@vueuse/core";
import type { Ref } from "vue";

export const createPageFullscreen = (target: Ref<HTMLElement | null>) => useFullscreen(target);
