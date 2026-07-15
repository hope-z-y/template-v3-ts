export const LOCK_SCREEN_STORAGE_KEY = "template-v3-ts:lock-screen";

export const readLockState = () => {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(LOCK_SCREEN_STORAGE_KEY) === "locked";
};

export const writeLockState = (locked: boolean) => {
  if (typeof window === "undefined") return;
  if (locked) window.sessionStorage.setItem(LOCK_SCREEN_STORAGE_KEY, "locked");
  else window.sessionStorage.removeItem(LOCK_SCREEN_STORAGE_KEY);
};
