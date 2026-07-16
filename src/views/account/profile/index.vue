<template>
  <NScrollbar class="h-full">
    <div class="mx-auto max-w-6xl p-3 md:p-6">
      <div class="mb-5">
        <h1 class="m-0 text-2xl font-semibold">个人信息</h1>
        <p class="mt-1 text-sm text-black/45 dark:text-white/45">维护你的公开资料与登录安全信息</p>
      </div>

      <div class="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <NCard title="基础资料" :bordered="false" class="rounded-2xl! shadow-sm">
          <div class="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)]">
            <div class="flex flex-col items-center">
              <NUpload
                accept="image/png,image/jpeg,image/webp"
                :show-file-list="false"
                :custom-request="uploadAvatar"
                :on-before-upload="validateAvatar"
                :disabled="avatarUploading"
              >
                <button type="button" class="avatar-upload" :disabled="avatarUploading" aria-label="更换头像">
                  <NAvatar round :size="112" :src="profileForm.avatar || UserAvatar" class="shadow-lg" />
                  <span class="avatar-upload__mask">
                    <NSpin v-if="avatarUploading" :size="24" stroke="#fff" />
                    <template v-else>更换头像</template>
                  </span>
                </button>
              </NUpload>
              <div class="mt-3 max-w-full truncate text-sm font-medium">{{ userInfo?.username }}</div>
              <div class="mt-1 text-xs text-black/40 dark:text-white/40">支持 PNG、JPEG、WebP，最大 2 MB</div>
            </div>

            <NForm ref="profileFormRef" :model="profileForm" :rules="profileRules" label-placement="top">
              <div class="grid gap-x-4 md:grid-cols-2">
                <NFormItem label="登录账号">
                  <NInput :value="userInfo?.account" disabled />
                </NFormItem>
                <NFormItem label="用户名称" path="username">
                  <NInput v-model:value="profileForm.username" placeholder="请输入用户名称" />
                </NFormItem>
                <NFormItem label="手机号" path="phone">
                  <NInput v-model:value="profileForm.phone" placeholder="请输入手机号" clearable />
                </NFormItem>
                <NFormItem label="邮箱" path="email">
                  <NInput v-model:value="profileForm.email" placeholder="请输入邮箱" clearable />
                </NFormItem>
                <NFormItem label="性别" path="gender">
                  <NSelect v-model:value="profileForm.gender" :options="GenderOptions" />
                </NFormItem>
              </div>
              <div class="flex justify-end">
                <NButton type="primary" :loading="profileSubmitting" :disabled="avatarUploading" @click="saveProfile">
                  保存资料
                </NButton>
              </div>
            </NForm>
          </div>
        </NCard>

        <div class="grid content-start gap-5">
          <NCard title="账户概览" :bordered="false" class="rounded-2xl! shadow-sm">
            <NDescriptions label-placement="left" :column="1">
              <NDescriptionsItem label="所属部门">{{ userInfo?.department?.deptName || "未分配" }}</NDescriptionsItem>
              <NDescriptionsItem label="账户状态">
                <NTag :type="userInfo?.status === 'enabled' ? 'success' : 'error'" size="small">
                  {{ userInfo?.status === "enabled" ? "正常" : "已禁用" }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="最后登录">{{ formatDate(userInfo?.lastLoginAt) }}</NDescriptionsItem>
              <NDescriptionsItem label="最后登录 IP">{{ userInfo?.lastLoginIp || "-" }}</NDescriptionsItem>
              <NDescriptionsItem label="密码更新时间">{{ formatDate(userInfo?.passwordUpdatedAt) }}</NDescriptionsItem>
            </NDescriptions>
            <div class="mt-4 border-t border-black/6 pt-4 dark:border-white/8">
              <div class="mb-2 text-xs text-black/45 dark:text-white/45">角色</div>
              <NFlex>
                <NTag v-for="role in userInfo?.roles" :key="role.id" size="small" type="info">{{ role.roleName }}</NTag>
                <span v-if="!userInfo?.roles.length" class="text-sm text-black/40 dark:text-white/40">未分配</span>
              </NFlex>
              <div class="mb-2 mt-4 text-xs text-black/45 dark:text-white/45">岗位</div>
              <NFlex>
                <NTag v-for="post in userInfo?.posts" :key="post.id" size="small">{{ post.postName }}</NTag>
                <span v-if="!userInfo?.posts.length" class="text-sm text-black/40 dark:text-white/40">未分配</span>
              </NFlex>
            </div>
          </NCard>
        </div>
      </div>

      <NCard title="修改密码" :bordered="false" class="mt-5 rounded-2xl! shadow-sm">
        <div class="max-w-xl">
          <NAlert type="warning" :show-icon="true" class="mb-5">
            密码修改成功后将退出当前登录会话，请使用新密码重新登录。
          </NAlert>
          <NForm ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-placement="top">
            <NFormItem label="当前密码" path="currentPassword">
              <NInput v-model:value="passwordForm.currentPassword" type="password" show-password-on="click" />
            </NFormItem>
            <div class="grid gap-x-4 md:grid-cols-2">
              <NFormItem label="新密码" path="newPassword">
                <NInput v-model:value="passwordForm.newPassword" type="password" show-password-on="click" />
              </NFormItem>
              <NFormItem label="确认新密码" path="confirmPassword">
                <NInput v-model:value="passwordForm.confirmPassword" type="password" show-password-on="click" />
              </NFormItem>
            </div>
            <NButton type="primary" :loading="passwordSubmitting" @click="changePassword">修改密码</NButton>
          </NForm>
        </div>
      </NCard>
    </div>
  </NScrollbar>
</template>

<script setup lang="ts">
import UserAvatar from "@/assets/images/Vue.png";
import { ChangeCurrentPassword, GetPublicEncryptKey, UpdateCurrentProfile } from "@/api/auth";
import { UploadFile } from "@/api/common";
import type { IProfileUserInfo } from "@/api/types";
import { useUserStore } from "@/stores";
import { Encrypt } from "@/utils";
import { GenderOptions } from "@/utils/constant";
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NFlex,
  NForm,
  NFormItem,
  NInput,
  NScrollbar,
  NSelect,
  NSpin,
  NTag,
  NUpload,
  useMessage,
  type FormInst,
  type FormRules,
  type UploadCustomRequestOptions,
  type UploadFileInfo,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { reactive, ref, watch } from "vue";

const message = useMessage();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const profileFormRef = ref<FormInst | null>(null);
const passwordFormRef = ref<FormInst | null>(null);
const profileSubmitting = ref(false);
const avatarUploading = ref(false);
const passwordSubmitting = ref(false);

const profileForm = reactive({
  username: "",
  phone: "",
  email: "",
  avatar: "",
  gender: "unknown" as IProfileUserInfo["gender"],
});
const passwordForm = reactive({ currentPassword: "", newPassword: "", confirmPassword: "" });

watch(
  userInfo,
  (value) => {
    if (!value) return;
    Object.assign(profileForm, {
      username: value.username,
      phone: value.phone ?? "",
      email: value.email ?? "",
      avatar: value.avatar ?? "",
      gender: value.gender,
    });
  },
  { immediate: true },
);

const profileRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名称", trigger: ["input", "blur"] },
    { max: 100, message: "用户名称不能超过 100 个字符", trigger: ["input", "blur"] },
  ],
  email: [{ type: "email", message: "邮箱格式不正确", trigger: ["input", "blur"] }],
};

const passwordRules: FormRules = {
  currentPassword: [{ required: true, message: "请输入当前密码", trigger: ["input", "blur"] }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: ["input", "blur"] },
    { min: 6, max: 64, message: "新密码长度必须为 6-64 位", trigger: ["input", "blur"] },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: ["input", "blur"] },
    {
      validator: (_rule, value) => value === passwordForm.newPassword,
      message: "两次输入的新密码不一致",
      trigger: ["input", "blur"],
    },
  ],
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString("zh-CN") : "-");

const validateAvatar = ({ file }: { file: UploadFileInfo }) => {
  const rawFile = file.file;
  if (!rawFile) return false;

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(rawFile.type)) {
    message.error("仅支持 PNG、JPEG 或 WebP 图片");
    return false;
  }
  if (rawFile.size > 2 * 1024 * 1024) {
    message.error("头像图片不能超过 2 MB");
    return false;
  }

  return true;
};

const uploadAvatar = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  if (!file.file) {
    onError();
    return;
  }

  avatarUploading.value = true;
  try {
    profileForm.avatar = await UploadFile(file.file);
    message.success("头像上传成功，请保存资料");
    onFinish();
  } catch {
    onError();
  } finally {
    avatarUploading.value = false;
  }
};

const saveProfile = async () => {
  try {
    await profileFormRef.value?.validate();
    profileSubmitting.value = true;
    const next = await UpdateCurrentProfile({
      username: profileForm.username.trim(),
      phone: profileForm.phone.trim() || null,
      email: profileForm.email.trim() || null,
      avatar: profileForm.avatar.trim() || null,
      gender: profileForm.gender,
    });
    userStore.updateUserInfo(next);
    message.success("个人资料已更新");
  } catch (error) {
    if (error instanceof Error) return;
  } finally {
    profileSubmitting.value = false;
  }
};

const changePassword = async () => {
  try {
    await passwordFormRef.value?.validate();
    passwordSubmitting.value = true;
    const publicKey = await GetPublicEncryptKey();
    const currentPassword = Encrypt(passwordForm.currentPassword, publicKey);
    const newPassword = Encrypt(passwordForm.newPassword, publicKey);
    if (!currentPassword || !newPassword) {
      message.error("密码加密失败");
      return;
    }
    await ChangeCurrentPassword({ currentPassword, newPassword });
    message.success("密码修改成功，请重新登录");
    await userStore.logout();
  } catch (error) {
    if (error instanceof Error) return;
  } finally {
    passwordSubmitting.value = false;
  }
};
</script>

<style scoped>
.avatar-upload {
  position: relative;
  display: block;
  width: 112px;
  height: 112px;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.avatar-upload:focus-visible {
  outline: 3px solid var(--n-color-target);
  outline-offset: 3px;
}

.avatar-upload__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 58%);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 160ms ease;
}

.avatar-upload:hover .avatar-upload__mask,
.avatar-upload:focus-visible .avatar-upload__mask,
.avatar-upload:disabled .avatar-upload__mask {
  opacity: 1;
}
</style>
