<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f5f5f5] dark:bg-[#141414]">
    <div
      id="container-wrapper"
      class="flex w-[360px] flex-col gap-4 rounded-lg border border-transparent bg-white px-6 py-8 shadow-[0_2px_8px_rgb(0_0_0_/_8%)] dark:border-white/8 dark:bg-[#202020] dark:shadow-[0_2px_8px_rgb(0_0_0_/_30%)]"
    >
      <h1 class="m-0 mb-2 text-center text-[22px] font-semibold text-black/88 dark:text-white/90">登录</h1>

      <NInput v-model:value="form.username" placeholder="请输入用户名" size="large" @keyup.enter="signIn" />

      <NInput
        v-model:value="form.password"
        type="password"
        show-password-on="click"
        placeholder="请输入密码"
        size="large"
        @keyup.enter="signIn"
      />

      <div v-if="captcha.enabled" class="flex items-center gap-3">
        <NInput
          v-model:value="form.code"
          class="flex-1"
          placeholder="请输入验证码"
          size="large"
          @keyup.enter="signIn"
        />
        <div
          class="captcha-img flex h-10 w-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-black/8 bg-black/3 dark:border-white/10 dark:bg-white/5"
          title="点击刷新验证码"
          @click="getCaptchaCode"
          v-html="captcha.img"
        />
      </div>

      <NButton type="primary" size="large" block :disabled="submitting" @click="signIn"> 登录 </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetCaptchaCode, GetPublicEncryptKey, SignIn } from "@/api/auth";
import type { ICaptchaResponse, ISignInParams } from "@/api/types";
import { useLoading } from "@/hooks";
import { useUserStore } from "@/stores";
import { Encrypt } from "@/utils";
import { NButton, NInput, useMessage } from "naive-ui";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const message = useMessage();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const { start, stop } = useLoading("#app");

//#region 登录

const submitting = ref(false);

const form = ref({
  username: "",
  password: "",
  code: "",
});

const signIn = async () => {
  try {
    submitting.value = true;
    start();

    const pwd = Encrypt(form.value.password, publicKey.value);
    if (!pwd) {
      message.error("密码加密失败");
      return;
    }

    const data: ISignInParams = {
      username: form.value.username.trim(),
      password: pwd,
    };

    if (captcha.value.enabled) {
      data.captchaCode = form.value.code.trim();
      data.captchaKey = captcha.value.captchaKey;
    }

    const result = await SignIn(data);
    userStore.setTokens(result);
    message.success("登录成功");

    const redirect = route.query.redirect;
    await router.replace(typeof redirect === "string" && redirect ? redirect : "/home");
  } catch {
    form.value.code = "";
    getCaptchaCode();
  } finally {
    submitting.value = false;
    stop();
  }
};
/** 校验表单 */
const validate = () => {};
//#endregion

// #region 获取验证码
const captcha = ref<ICaptchaResponse>({
  enabled: true,
  captchaKey: "",
  img: "",
});

const getCaptchaCode = async () => {
  try {
    const data = await GetCaptchaCode();
    captcha.value = data;
    if (!data.enabled) {
      form.value.code = "";
    }
  } catch {
    // 错误提示由响应拦截器处理
  }
};

getCaptchaCode();
// #endregion

//#region  获取公钥
const publicKey = ref("");

const getPublicKey = async () => {
  try {
    const data = await GetPublicEncryptKey();
    publicKey.value = data.publicKey;
  } catch {
    // 错误提示由响应拦截器处理
  }
};

getPublicKey();
// #endregion
</script>

<style scoped>
.captcha-img :deep(svg) {
  height: 100%;
  width: 100%;
}
</style>
