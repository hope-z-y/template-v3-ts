import { GetPublicEncryptKey, VerifyCurrentPassword } from "@/api/auth";
import { Encrypt } from "@/utils";
import { ref, readonly, watch } from "vue";
import { globalConfig } from "../use-global-config/use-global-config";
import { readLockState, writeLockState } from "./modules/lock-storage";
import type { LockScreenApi } from "./types";

const isLocked = ref(readLockState());
const unlocking = ref(false);

const lock = () => {
  isLocked.value = true;
  writeLockState(true);
};

const clear = () => {
  isLocked.value = false;
  writeLockState(false);
};

const unlock = async (password: string) => {
  if (unlocking.value || !password.trim()) return false;
  unlocking.value = true;
  try {
    const publicKey = await GetPublicEncryptKey();
    const encrypted = Encrypt(password, publicKey);
    if (!encrypted) return false;
    await VerifyCurrentPassword({ password: encrypted });
    clear();
    return true;
  } finally {
    unlocking.value = false;
  }
};

const startAutoLock = () => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastActiveAt = Date.now();

  const schedule = () => {
    if (timer) clearTimeout(timer);
    const minutes = globalConfig.autoLockMinutes;
    if (!minutes || isLocked.value) return;

    const delay = Math.max(0, minutes * 60_000 - (Date.now() - lastActiveAt));
    timer = setTimeout(lock, delay);
  };

  const markActive = () => {
    if (isLocked.value) return;
    lastActiveAt = Date.now();
    schedule();
  };

  const handleVisibility = () => {
    if (document.visibilityState !== "visible") return;
    if (globalConfig.autoLockMinutes && Date.now() - lastActiveAt >= globalConfig.autoLockMinutes * 60_000) lock();
    else schedule();
  };

  const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "mousemove", "touchstart"];
  events.forEach((event) => window.addEventListener(event, markActive, { passive: true }));
  document.addEventListener("visibilitychange", handleVisibility);
  const stopConfigWatch = watch(() => globalConfig.autoLockMinutes, markActive);
  const stopLockWatch = watch(isLocked, (locked) => {
    if (!locked) markActive();
  });
  schedule();

  return () => {
    if (timer) clearTimeout(timer);
    events.forEach((event) => window.removeEventListener(event, markActive));
    document.removeEventListener("visibilitychange", handleVisibility);
    stopConfigWatch();
    stopLockWatch();
  };
};

export const useLockScreen = (): LockScreenApi & {
  isLocked: Readonly<typeof isLocked>;
  unlocking: Readonly<typeof unlocking>;
} => ({ isLocked: readonly(isLocked), unlocking: readonly(unlocking), lock, clear, unlock, startAutoLock });
