import type { IAuthTokenResponse, IUser } from "@/api/types";
import { useMenuTagStore } from "@/stores/menu-tag";
import { STORE_KEY } from "@/utils/modules/store-key";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
  STORE_KEY.UserStore,
  () => {
    /** 会话 Token */
    const accessToken = ref("");

    /** 刷新 Token */
    const refreshToken = ref("");

    const userInfo = ref<IUser>();

    const setTokens = (tokens: IAuthTokenResponse) => {
      accessToken.value = tokens.accessToken;
      refreshToken.value = tokens.refreshToken;
    };

    const clearAuth = () => {
      accessToken.value = "";
      refreshToken.value = "";
      userInfo.value = undefined;
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
        useMenuTagStore().reset();
        clearAuth();

        const { router } = await import("@/router");
        if (router.currentRoute.value.name !== "Login") {
          await router.push({ name: "Login" });
        }
      }
    };

    const lockScreen = () => {
      console.info("[user] lock screen");
    };

    return {
      userInfo,
      accessToken,
      refreshToken,
      setTokens,
      clearAuth,
      logout,
      lockScreen,
    };
  },
  {
    persist: {
      key: STORE_KEY.UserStore,
    },
  },
);
