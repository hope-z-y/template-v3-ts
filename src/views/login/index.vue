<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f5f5f5] dark:bg-[#141414]">
    <div
      id="container-wrapper"
      class="flex w-[360px] flex-col gap-4 rounded-lg border border-transparent bg-white px-6 py-8 shadow-[0_2px_8px_rgb(0_0_0_/_8%)] dark:border-white/8 dark:bg-[#202020] dark:shadow-[0_2px_8px_rgb(0_0_0_/_30%)]"
    >
      <h1 class="m-0 mb-2 text-center text-[22px] font-semibold text-black/88 dark:text-white/90">登录</h1>

      <NForm ref="formRef" :model="form" :rules="rules" :show-label="false" class="flex flex-col gap-1">
        <NFormItem path="account">
          <NInput
            v-model:value="form.account"
            placeholder="请输入用户名"
            size="large"
            clearable
            @keyup.enter="signIn"
          />
        </NFormItem>

        <NFormItem path="password">
          <NInput
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            size="large"
            clearable
            @keyup.enter="signIn"
          />
        </NFormItem>

        <NFormItem v-if="captcha.enabled" path="code">
          <div class="flex w-full items-center gap-3">
            <NInput
              v-model:value="form.code"
              class="flex-1"
              placeholder="请输入验证码"
              size="large"
              clearable
              @keyup.enter="signIn"
            />
            <SafeCaptcha :img="captcha.img" :loading="captchaLoading" @refresh="getCaptchaCode" />
          </div>
        </NFormItem>
      </NForm>

      <NButton
        type="primary"
        size="large"
        block
        :loading="submitting || publicKeyLoading"
        :disabled="submitting || publicKeyLoading"
        @click="signIn"
      >
        登录
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetCaptchaCode, GetPublicEncryptKey, SignIn } from "@/api/auth";
import type { ICaptchaResponse, ISignInParams } from "@/api/types";
import { SafeCaptcha } from "@/components";
import { bootstrap } from "@/bootstrap";
import { useLoading } from "@/hooks";
import { useMenuStore, useUserStore } from "@/stores";
import { Encrypt } from "@/utils";
import { NButton, NForm, NFormItem, NInput, useMessage, type FormInst, type FormRules } from "naive-ui";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const message = useMessage();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const menuStore = useMenuStore();

const { start, stop } = useLoading("#app");

// #region 登录表单
interface LoginForm {
  account: string;
  password: string;
  code: string;
}

const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const form = ref<LoginForm>({
  account: "admin",
  password: "admin123456",
  code: "",
});

const requiredTrimRule = (messageText: string) => ({
  validator: (_rule: unknown, value: string) => Boolean(value?.trim()),
  message: messageText,
  trigger: ["input", "blur"],
});

// 验证码关闭时不校验 code，避免隐藏字段阻塞登录。
const rules = computed<FormRules>(() => ({
  account: [requiredTrimRule("请输入用户名")],
  password: [requiredTrimRule("请输入密码")],
  code: captcha.value.enabled ? [requiredTrimRule("请输入验证码")] : [],
}));

const validateForm = async () => {
  try {
    await formRef.value?.validate();
    return true;
  } catch {
    return false;
  }
};
// #endregion

// #region 登录流程
const resolveRedirectPath = () => {
  const redirect = route.query.redirect;

  // 只允许站内路径回跳，避免把外部 URL 当成登录后跳转地址。
  if (typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }

  return "/home";
};

const signIn = async () => {
  if (submitting.value || publicKeyLoading.value) return;
  if (!(await validateForm())) return;

  if (!publicKey.value) {
    message.warning("登录公钥未加载完成，请稍后重试");
    await getPublicKey();
    return;
  }

  if (captcha.value.enabled && !captcha.value.captchaKey) {
    message.warning("验证码未加载完成，请刷新后重试");
    await getCaptchaCode();
    return;
  }

  try {
    submitting.value = true;
    start();

    const pwd = Encrypt(form.value.password, publicKey.value);
    if (!pwd) {
      message.error("密钥无效，密码加密失败");
      return;
    }

    const data: ISignInParams = {
      account: form.value.account.trim(),
      password: pwd,
      captchaCode: form.value.code.trim(),
      captchaKey: captcha.value.captchaKey || "",
    };

    const result = await SignIn(data);
    userStore.setTokens(result);
    menuStore.reset();
    // Profile 会一次返回用户、权限和菜单，loadProfile 内部会继续完成动态路由注册。
    await userStore.loadProfile(true);
    await bootstrap();
    message.success("登录成功");

    await router.replace(resolveRedirectPath());
  } catch {
    if (captcha.value.enabled) {
      form.value.code = "";
      await getCaptchaCode();
    }
  } finally {
    submitting.value = false;
    stop();
  }
};
// #endregion

// #region 验证码
const captchaLoading = ref(false);
const captcha = ref<ICaptchaResponse>({
  enabled: true,
  captchaKey: "",
  img: "",
  expireIn: 0,
});

const getCaptchaCode = async () => {
  if (captchaLoading.value) return;

  try {
    captchaLoading.value = true;
    captcha.value = await GetCaptchaCode();
    if (!captcha.value.enabled) {
      form.value.code = "";
    }
  } catch {
    // 错误提示由响应拦截器处理。
  } finally {
    captchaLoading.value = false;
  }
};

void getCaptchaCode();
// #endregion

// #region 登录公钥
const publicKey = ref("");
const publicKeyLoading = ref(false);

const getPublicKey = async () => {
  try {
    publicKeyLoading.value = true;
    const data = await GetPublicEncryptKey();
    publicKey.value = data;
  } catch {
    publicKey.value = "";
    // 错误提示由响应拦截器处理。
  } finally {
    publicKeyLoading.value = false;
  }
};

void getPublicKey();
// #endregion
</script>

<style scoped></style>
