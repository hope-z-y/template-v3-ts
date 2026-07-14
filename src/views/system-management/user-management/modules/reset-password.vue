<!--
  用户管理 -> 重置密码（useModal 内容方）

  当前操作的用户由列表页 setData 传入，提交前对新密码做 RSA 加密后调用 ResetUserPassword 接口。
-->

<template>
  <Modal>
    <!-- 提示当前操作对象 -->
    <p v-if="user" class="m-0 mb-4 text-sm text-black/65 dark:text-white/65">
      正在为用户「{{ user.username || user.account }}」重置登录密码
    </p>

    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="新密码" path="password">
        <NInput
          v-model:value="formModel.password"
          type="password"
          show-password-on="click"
          placeholder="请输入新密码"
          maxlength="50"
        />
      </NFormItem>
      <!-- confirmPassword 需与 password 一致 -->
      <NFormItem label="确认密码" path="confirmPassword">
        <NInput
          v-model:value="formModel.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入新密码"
          maxlength="50"
        />
      </NFormItem>
    </NForm>
  </Modal>
</template>

<script setup lang="ts">
import { GetPublicEncryptKey } from "@/api/auth";
import { ResetUserPassword } from "@/api/system-management";
import { useModal } from "@/hooks";
import { Encrypt } from "@/utils";
import { NForm, NFormItem, NInput, useMessage, type FormInst, type FormRules } from "naive-ui";
import { computed, ref } from "vue";
import type { IUserRow } from "../data";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const createDefaultForm = (): ResetPasswordForm => ({
  password: "",
  confirmPassword: "",
});

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = ref<ResetPasswordForm>(createDefaultForm());

const [Modal, modalApi] = useModal<IUserRow>({
  title: "重置密码",
  width: "420px",
  onConfirm: handleSubmit,
  // 每次打开时重置为空表单
  onOpened: () => {
    formModel.value = createDefaultForm();
  },
  // 关闭后清空表单与校验，避免下次打开看到旧密码
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

/** 当前操作的用户（列表页 setData 传入） */
const user = computed(() => modalApi.getData() ?? null);

const rules: FormRules = {
  password: [
    { required: true, message: "请输入新密码", trigger: ["input", "blur"] },
    { min: 6, message: "密码长度不能少于 6 位", trigger: ["input", "blur"] },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: ["input", "blur"] },
    {
      // 自定义校验：两次密码必须相同
      validator: (_rule, value: string) => {
        if (!value) return true;
        return value === formModel.value.password;
      },
      message: "两次输入的密码不一致",
      trigger: ["input", "blur"],
    },
  ],
};

/** 点击"确定"：校验 -> 取公钥加密 -> 提交 -> 关闭 */
async function handleSubmit() {
  const currentUser = modalApi.getData();
  if (!currentUser) return;

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  try {
    modalApi.lock();

    // 与登录 / 新增用户相同：先取公钥再加密密码
    const publicKey = await GetPublicEncryptKey();
    const encryptedPassword = Encrypt(formModel.value.password, publicKey);
    if (!encryptedPassword) {
      message.error("密码加密失败");
      return;
    }

    await ResetUserPassword(currentUser.id, { password: encryptedPassword });
    message.success("密码重置成功");
    modalApi.close();
  } catch {
    // 错误提示由响应拦截器统一处理
  } finally {
    modalApi.unlock();
  }
}
</script>

<style scoped></style>
