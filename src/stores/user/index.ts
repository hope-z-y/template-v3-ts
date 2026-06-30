import { useMenuTagStore } from "@/stores/menu-tag";
import { STORE_KEY } from "@/utils/store-key";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(STORE_KEY.UserStore, () => {
  const userInfo = ref({
    name: "张三",
    email: "zhangsan@example.com",
    role: "超级管理员",
    department: "研发部门 · 前端组",
  });

  const logout = () => {
    useMenuTagStore().reset();
    console.info("[user] logout");
  };

  const lockScreen = () => {
    console.info("[user] lock screen");
  };

  return {
    userInfo,
    logout,
    lockScreen,
  };
});
