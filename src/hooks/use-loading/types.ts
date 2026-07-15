import type { ShallowRef } from "vue";

export type UseLoadingTarget =
  HTMLElement | null | undefined | Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>> | string;
