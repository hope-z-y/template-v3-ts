<!--
  用户管理 -> 重置密码（弹窗）

  接收当前用户 user，提交前对新密码做 RSA 加密后调用 ResetUserPassword 接口。
-->

<template>
  <!-- #region 弹窗与表单 -->
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 420px"
    title="重置密码"
    :mask-closable="false"
    :show-icon="false"
    content-class=" my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
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

    <template #action>
      <div class="flex justify-end gap-2">
        <NButton @click="handleCancel">
          <template #icon>
            <NIcon>
              <Dismiss24Regular />
            </NIcon>
          </template>
          取消
        </NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          <template #icon>
            <NIcon>
              <Checkmark24Regular />
            </NIcon>
          </template>
          确定
        </NButton>
      </div>
    </template>
  </NModal>
  <!-- #endregion -->
</template>

<script setup lang="ts">
// #region 依赖引入
import { GetPublicEncryptKey } from "@/api/auth";
import { ResetUserPassword } from "@/api/system-management";
import type { IUserRow } from "../data";
import { Encrypt } from "@/utils";
import { Checkmark24Regular, Dismiss24Regular } from "@vicons/fluent";
import { NButton, NForm, NFormItem, NIcon, NInput, NModal, useMessage, type FormInst, type FormRules } from "naive-ui";
import { ref, watch } from "vue";
// #endregion

// #region 表单数据模型
interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const createDefaultForm = (): ResetPasswordForm => ({
  password: "",
  confirmPassword: "",
});
// #endregion

// #region 组件通信（Props / Emits / v-model）
const props = defineProps<{
  user?: IUserRow | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>("show", { required: true });
// #endregion

// #region 响应式状态
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const formModel = ref<ResetPasswordForm>(createDefaultForm());
// #endregion

// #region 表单校验规则
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
// #endregion

// #region 弹窗交互
const handleCancel = () => {
  visible.value = false;
};

/** 关闭后清空表单与校验，避免下次打开看到旧密码 */
const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
};
// #endregion

// #region 提交重置密码
const handleSubmit = async () => {
  if (!props.user) return;

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  try {
    submitting.value = true;

    // 与登录/新增用户相同：先取公钥再加密密码
    const { publicKey } = await GetPublicEncryptKey();
    const encryptedPassword = Encrypt(formModel.value.password, publicKey);
    if (!encryptedPassword) {
      message.error("密码加密失败");
      return;
    }

    await ResetUserPassword(props.user.id, { password: encryptedPassword });
    message.success("密码重置成功");
    visible.value = false;
    emit("success");
  } catch {
    // 错误提示由响应拦截器统一处理
  } finally {
    submitting.value = false;
  }
};
// #endregion

// #region 监听弹窗打开
// 每次打开时重置为空表单
watch(
  () => visible.value,
  (show) => {
    if (!show) return;
    formModel.value = createDefaultForm();
  },
);
// #endregion
</script>

<style scoped></style>
