import type { IAuthTokenResponse, IUser, IUserProfile } from "@/api/types";
import { fetchRefreshToken } from "@/request/modules/refresh-token";
import { useMenuStore } from "@/stores/menu";
import { useMenuTagStore } from "@/stores/menu-tag";
import { STORE_KEY } from "@/utils/modules/store-key";
import { computed, ref } from "vue";
import { defineStore } from "pinia";

type AuthStorageStrategy = "memory-refresh" | "legacy-localStorage";
type PermissionMode = "some" | "every";
type RoleLike =
  | string
  | {
      roleCode?: unknown;
      code?: unknown;
      value?: unknown;
      role?: RoleLike | null;
    };
type PermissionLike =
  | string
  | {
      permission?: unknown;
      perms?: unknown;
      code?: unknown;
      value?: unknown;
    };
type ProfileLike = IUserProfile & {
  isAdmin?: boolean;
  superAdmin?: boolean;
  roles?: RoleLike[];
  permissions?: PermissionLike[];
  user?: IUser & {
    isAdmin?: boolean;
    superAdmin?: boolean;
    roles?: RoleLike[];
    userRoles?: RoleLike[];
    permissions?: PermissionLike[];
  };
};

/**
 * Token 存储策略：
 * - memory-refresh：accessToken 只放内存，refreshToken 放 sessionStorage，默认更安全。
 * - legacy-localStorage：兼容旧项目，把 token 存 localStorage，方便平滑升级。
 */
const AUTH_STORAGE_STRATEGY: AuthStorageStrategy =
  import.meta.env.VITE_AUTH_STORAGE_STRATEGY === "legacy-localStorage" ? "legacy-localStorage" : "memory-refresh";

/**
 * 是否信任菜单树中的按钮权限。
 * 默认 false：以 /auth/profile.permissions 为权限唯一可信来源，避免未过滤的菜单树误授按钮权限。
 */
const TRUST_MENU_PERMISSIONS = import.meta.env.VITE_TRUST_MENU_PERMISSIONS === "true";

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

const readStringField = (source: object, keys: string[]) => {
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

/** 后端常见返回结构不完全一致，这里把角色统一收敛为 roleCode 字符串。 */
const getRoleCode = (item: RoleLike): string | undefined => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return undefined;

  const direct = readStringField(item, ["roleCode", "code", "value"]);
  if (direct) return direct;

  return item.role ? getRoleCode(item.role) : undefined;
};

/** 权限字段常见命名有 permission/perms/code，这里统一收敛为权限标识字符串。 */
const getPermissionCode = (item: PermissionLike): string | undefined => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return undefined;

  return readStringField(item, ["permission", "perms", "code", "value"]);
};

const normalizeRolesFromProfile = (profile: IUserProfile) => {
  const profileLike = profile as ProfileLike;
  const roleCodes = [
    ...(profileLike.roles ?? []).map(getRoleCode),
    ...(profileLike.user?.roles ?? []).map(getRoleCode),
    ...(profileLike.user?.userRoles ?? []).map(getRoleCode),
  ];

  if (profileLike.isAdmin || profileLike.superAdmin || profileLike.user?.isAdmin || profileLike.user?.superAdmin) {
    roleCodes.push("admin");
  }

  return normalizeList(roleCodes);
};

const normalizePermissionsFromProfile = (profile: IUserProfile) => {
  const profileLike = profile as ProfileLike;
  return normalizeList([
    ...(profileLike.permissions ?? []).map(getPermissionCode),
    ...(profileLike.user?.permissions ?? []).map(getPermissionCode),
  ]);
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

  const userInfo = ref<IUser>();
  const roles = ref<string[]>([]);
  const profilePermissions = ref<string[]>([]);
  const menuPermissions = ref<string[]>([]);
  const profileLoaded = ref(false);

  // profile 权限来自 /auth/profile，是默认可信来源；菜单权限只有显式开启信任时才会合并。
  const permissions = computed(() =>
    normalizeList(
      TRUST_MENU_PERMISSIONS ? [...profilePermissions.value, ...menuPermissions.value] : profilePermissions.value,
    ),
  );

  const setTokens = (tokens: IAuthTokenResponse) => {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    persistTokens(tokens);
  };

  const setProfile = (profile: IUserProfile) => {
    userInfo.value = profile.user;
    roles.value = normalizeRolesFromProfile(profile);
    profilePermissions.value = normalizePermissionsFromProfile(profile);
    profileLoaded.value = true;
  };

  const setMenuPermissions = (items: string[]) => {
    menuPermissions.value = normalizeList(items);
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
    menuPermissions.value = [];
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
        await SignOut();
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
    setMenuPermissions,
    hasPermission,
    hasRole,
    clearAuth,
    resetSession,
    loadProfile,
    refreshSession,
    logout,
  };
});
