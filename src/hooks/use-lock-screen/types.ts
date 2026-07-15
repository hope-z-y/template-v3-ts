export interface LockScreenApi {
  lock: () => void;
  clear: () => void;
  unlock: (password: string) => Promise<boolean>;
  startAutoLock: () => () => void;
}
