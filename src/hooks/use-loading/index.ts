import { createApp, isRef, onUnmounted, ref, type App, type ShallowRef } from "vue";
import { Loading } from "@/components";

export type UseLoadingTarget =
  HTMLElement | null | undefined | Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>> | string;

const resolveElement = (source: UseLoadingTarget): HTMLElement | null => {
  if (!source) return null;
  if (typeof source === "string") {
    return document.querySelector<HTMLElement>(source);
  }
  if (isRef(source)) {
    return source.value;
  }
  return source;
};

export function useLoading(target: UseLoadingTarget) {
  const loading = ref(false);

  let containerEl: HTMLElement | null = null;
  let overlayEl: HTMLElement | null = null;
  let overlayApp: App | null = null;
  let savedPosition: string | null = null;

  const mountOverlay = (el: HTMLElement) => {
    const { position } = getComputedStyle(el);
    if (position === "static") {
      savedPosition = el.style.position;
      el.style.position = "relative";
    }

    overlayEl = document.createElement("div");
    overlayEl.className = "use-loading-overlay";
    Object.assign(overlayEl.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(10, 10, 15, 0.55)",
      zIndex: "9999",
    });

    const mountPoint = document.createElement("div");
    overlayEl.appendChild(mountPoint);
    el.appendChild(overlayEl);

    overlayApp = createApp(Loading);
    overlayApp.mount(mountPoint);
  };

  const unmountOverlay = (el: HTMLElement) => {
    overlayApp?.unmount();
    overlayApp = null;
    overlayEl?.remove();
    overlayEl = null;

    if (savedPosition !== null) {
      el.style.position = savedPosition;
      savedPosition = null;
    }
  };

  const start = () => {
    if (loading.value) return;

    const el = resolveElement(target);
    if (!el) {
      console.warn("[useLoading] target element not found:", target);
      return;
    }

    containerEl = el;
    mountOverlay(el);
    loading.value = true;
  };

  const stop = () => {
    if (!loading.value || !containerEl) return;

    unmountOverlay(containerEl);
    containerEl = null;
    loading.value = false;
  };

  onUnmounted(() => {
    stop();
  });

  return {
    start,
    stop,
    loading,
  };
}
