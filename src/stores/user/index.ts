import type { IAuthTokenResponse, IProfileUserInfo, IUserProfile } from "@/api/types";
import { fetchRefreshToken } from "@/request/modules/refresh-token";
import { useMenuStore } from "@/stores/menu";
import { useMenuTagStore } from "@/stores/menu-tag";
import { STORE_KEY } from "@/utils";
import { computed, ref } from "vue";
import { defineStore } from "pinia";

type AuthStorageStrategy = "memory-refresh" | "legacy-localStorage";
type PermissionMode = "some" | "every";

/**
 * Token 存储策略：
 * - memory-refresh：accessToken 只放内存，refreshToken 放 sessionStorage，默认更安全。
 * - legacy-localStorage：兼容旧项目，把 token 存 localStorage，方便平滑升级。
 */
const AUTH_STORAGE_STRATEGY: AuthStorageStrategy =
  import.meta.env.VITE_AUTH_STORAGE_STRATEGY === "legacy-localStorage" ? "legacy-localStorage" : "memory-refresh";

const canUseStorage = () => typeof window !== "undefined";

const getRefreshStorage = () => {
  if (!canUseStorage()) return undefined;
  return AUTH_STORAGE_STRATEGY === "legacy-localStorage" ? window.localStorage : window.sessionStorage;
};

/** 兼容旧版本 Pinia 持久化格式，升级后用户不需要被强制重新登录。 */
const readLegacyPersistedToken = (key: "accessToken" | "refreshToken") => {
  if (!canUseStorage()) return "";

  try {
    const raw = window.localStorage.getItem(STORE_KEY.UserStore);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as Partial<Record<"accessToken" | "refreshToken", string>>;
    return parsed[key] ?? "";
  } catch {
    return "";
  }
};

const readStoredAccessToken = () => {
  if (!canUseStorage() || AUTH_STORAGE_STRATEGY !== "legacy-localStorage") return "";
  return window.localStorage.getItem(STORE_KEY.AuthAccessToken) || readLegacyPersistedToken("accessToken");
};

const readStoredRefreshToken = () => {
  const storage = getRefreshStorage();
  return storage?.getItem(STORE_KEY.AuthRefreshToken) || readLegacyPersistedToken("refreshToken");
};

const persistTokens = (tokens: IAuthTokenResponse) => {
  const refreshStorage = getRefreshStorage();
  refreshStorage?.setItem(STORE_KEY.AuthRefreshToken, tokens.refreshToken);

  if (AUTH_STORAGE_STRATEGY === "legacy-localStorage" && canUseStorage()) {
    window.localStorage.setItem(STORE_KEY.AuthAccessToken, tokens.accessToken);
  }
};

const clearStoredTokens = () => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(STORE_KEY.AuthAccessToken);
  window.localStorage.removeItem(STORE_KEY.UserStore);
  window.localStorage.removeItem(STORE_KEY.AuthRefreshToken);
  window.sessionStorage.removeItem(STORE_KEY.AuthRefreshToken);
};

const normalizeList = (items?: Array<string | undefined | null>) => {
  const normalized = (items ?? []).map((item) => item?.trim()).filter((item): item is string => Boolean(item));
  return Array.from(new Set(normalized));
};

/** Profile 只接受当前后端契约，角色标识直接读取 userInfo.roles[].roleKey。 */
const normalizeRolesFromProfile = (profile: IUserProfile) => {
  const roleCodes = profile.userInfo.roles.map((role) => role.roleKey);
  if (profile.userInfo.isAdmin) {
    roleCodes.push("admin");
  }

  return normalizeList(roleCodes);
};

/** mode 为 some 时满足任意一个即可；every 时必须全部拥有。 */
const matchAnyOrEvery = (owned: string[], expected: string | string[], mode: PermissionMode) => {
  const list = Array.isArray(expected) ? expected : [expected];
  const normalized = normalizeList(list);
  if (!normalized.length) return true;

  const ownedSet = new Set(owned);
  return mode === "every"
    ? normalized.every((item) => ownedSet.has(item))
    : normalized.some((item) => ownedSet.has(item));
};

export const useUserStore = defineStore(STORE_KEY.UserStore, () => {
  /** 会话 Token：默认仅存在内存中 */
  const accessToken = ref(readStoredAccessToken());

  /** 刷新 Token：按策略保存，默认 sessionStorage */
  const refreshToken = ref(readStoredRefreshToken());

  const userInfo = ref<IProfileUserInfo>();
  const roles = ref<string[]>([]);
  const profilePermissions = ref<string[]>([]);
  const profileLoaded = ref(false);

  // 后端已在 profile.permissions 返回完整权限，菜单树不再承担按钮授权职责。
  const permissions = computed(() => profilePermissions.value);

  const setTokens = (tokens: IAuthTokenResponse) => {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    persistTokens(tokens);
  };

  const setProfile = (profile: IUserProfile) => {
    userInfo.value = profile.userInfo;
    roles.value = normalizeRolesFromProfile(profile);
    profilePermissions.value = normalizeList(profile.permissions);
    profileLoaded.value = true;
  };

  const hasPermission = (permission: string | string[], mode: PermissionMode = "some") => {
    // admin 与 *:*:* 视为超级权限，适合后台模板的管理员账号。
    if (roles.value.includes("admin") || permissions.value.includes("*:*:*")) return true;
    return matchAnyOrEvery(permissions.value, permission, mode);
  };

  const hasRole = (role: string | string[], mode: PermissionMode = "some") => {
    return matchAnyOrEvery(roles.value, role, mode);
  };

  const clearAuth = () => {
    accessToken.value = "";
    refreshToken.value = "";
    userInfo.value = undefined;
    roles.value = [];
    profilePermissions.value = [];
    profileLoaded.value = false;
    clearStoredTokens();
  };

  const resetSession = () => {
    // 401、刷新失败、退出登录都走这里，确保用户信息、菜单、标签页一起清空。
    useMenuTagStore().reset();
    useMenuStore().reset();
    clearAuth();
  };

  const loadProfile = async (force = false) => {
    if (!accessToken.value) return;
    if (!force && profileLoaded.value) return;

    // 动态导入避免 store 初始化时过早加载 API 模块，降低循环依赖风险。
    const { GetCurrentUser } = await import("@/api/auth");
    const profile = await GetCurrentUser();
    // 一个 Profile 响应同时驱动用户权限和动态路由，避免重复请求造成状态不一致。
    await useMenuStore().initRoutes(profile.menus);
    setProfile(profile);
  };

  const refreshSession = async () => {
    if (!refreshToken.value) return false;

    try {
      // refresh 成功后只更新 token；profile 会在路由守卫恢复会话时按需重新拉取。
      const tokens = await fetchRefreshToken(refreshToken.value);
      setTokens(tokens);
      return true;
    } catch {
      resetSession();
      return false;
    }
  };

  const logout = async () => {
    try {
      if (accessToken.value) {
        const { SignOut } = await import("@/api/auth");
        await SignOut({ refreshToken: refreshToken.value });
      }
    } catch {
      // 退出接口失败仍清理本地会话
    } finally {
      resetSession();

      const { router } = await import("@/router");
      if (router.currentRoute.value.name !== "Login") {
        await router.push({ name: "Login" });
      }
    }
  };

  return {
    userInfo,
    accessToken,
    refreshToken,
    roles,
    permissions,
    profileLoaded,
    setTokens,
    setProfile,
    hasPermission,
    hasRole,
    clearAuth,
    resetSession,
    loadProfile,
    refreshSession,
    logout,
  };
});
