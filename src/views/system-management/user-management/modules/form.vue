<!--
  用户管理 -> 新增 / 编辑表单（useModal 内容方）

  弹窗外壳（标题 / 按钮 / loading）由 useModal 提供，这里只关心表单本身。
  打开时会并行加载部门树、角色、岗位；编辑模式额外拉取用户详情。
-->

<template>
  <Modal>
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <div class="grid grid-cols-2 gap-x-4">
        <!-- 登录账号：编辑时不可改 -->
        <NFormItem label="登录账号" path="account">
          <NInput
            v-model:value="formModel.account"
            placeholder="请输入登录账号"
            maxlength="50"
            show-count
            :disabled="mode === 'edit'"
          />
        </NFormItem>
        <!-- 密码仅新增时展示，必须由管理员显式填写，避免模板内置弱口令。 -->
        <NFormItem v-if="mode === 'create'" label="登录密码" path="password">
          <NInput
            v-model:value="formModel.password"
            type="password"
            show-password-on="click"
            placeholder="请设置初始密码"
            maxlength="50"
          />
        </NFormItem>
        <NFormItem label="用户名称" path="username">
          <NInput v-model:value="formModel.username" placeholder="请输入用户名称" maxlength="50" show-count />
        </NFormItem>
        <NFormItem label="手机号" path="phone">
          <NInput v-model:value="formModel.phone" placeholder="请输入手机号" maxlength="20" />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="formModel.email" placeholder="请输入邮箱" maxlength="100" />
        </NFormItem>
        <NFormItem label="性别" path="gender">
          <NRadioGroup v-model:value="formModel.gender">
            <NSpace>
              <NRadio v-for="item in GenderOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <!-- 部门树形选择 -->
        <NFormItem label="所属部门" path="deptId">
          <NTreeSelect
            v-model:value="formModel.deptId"
            :options="deptTreeOptions"
            :loading="deptLoading"
            placeholder="请选择所属部门"
            clearable
            default-expand-all
            key-field="key"
            label-field="label"
            children-field="children"
          />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="formModel.status">
            <NSpace>
              <NRadio v-for="item in CommonStatusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <!-- 角色、岗位支持多选 -->
        <NFormItem label="角色" path="roleIds">
          <NSelect
            v-model:value="formModel.roleIds"
            :options="roleOptions"
            :loading="roleLoading"
            placeholder="请选择角色"
            multiple
            filterable
            clearable
          />
        </NFormItem>
        <NFormItem label="岗位" path="postIds">
          <NSelect
            v-model:value="formModel.postIds"
            :options="postOptions"
            :loading="postLoading"
            placeholder="请选择岗位"
            multiple
            filterable
            clearable
          />
        </NFormItem>
        <NFormItem label="备注" path="remark" class="col-span-2">
          <NInput
            v-model:value="formModel.remark"
            type="textarea"
            placeholder="请输入备注"
            maxlength="500"
            show-count
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </NFormItem>
      </div>
    </NForm>
  </Modal>
</template>

<script setup lang="ts">
import { GetPublicEncryptKey } from "@/api/auth";
import { CreateUser, GetDeptTree, GetPostList, GetRoleList, GetUserById, UpdateUser } from "@/api/system-management";
import type { CommonStatus, Gender, ICreateUserParams, IDept, IUpdateUserParams } from "@/api/types";
import { useModal } from "@/hooks";
import { Encrypt } from "@/utils";
import {
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTreeSelect,
  useMessage,
  type FormInst,
  type FormRules,
  type SelectOption,
  type TreeSelectOption,
} from "naive-ui";
import { CommonStatusOptions, GenderOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IUserModalData } from "../data";

/** 中国大陆手机号正则 */
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
/** 简单邮箱格式校验 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserFormModel {
  account: string;
  password: string;
  username: string;
  phone: string;
  email: string;
  gender: Gender;
  deptId: string | null;
  status: CommonStatus;
  remark: string;
  roleIds: string[];
  postIds: string[];
}

/** 表单初始值工厂函数，便于重置 */
const createDefaultForm = (): UserFormModel => ({
  account: "",
  password: "",
  username: "",
  phone: "",
  email: "",
  gender: "unknown",
  deptId: null,
  status: "enabled",
  remark: "",
  roleIds: [],
  postIds: [],
});

const emit = defineEmits<{
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const deptLoading = ref(false);
const roleLoading = ref(false);
const postLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const roleOptions = ref<SelectOption[]>([]);
const postOptions = ref<SelectOption[]>([]);
const formModel = ref<UserFormModel>(createDefaultForm());

const [Modal, modalApi] = useModal<IUserModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑用户" : "新增用户"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

const mode = computed(() => modalApi.getData()?.mode ?? "create");

// 编辑模式下不校验 password；手机号 / 邮箱为空时不强制，有值则校验格式
const rules = computed<FormRules>(() => ({
  account: [{ required: true, message: "请输入登录账号", trigger: ["input", "blur"] }],
  password:
    mode.value === "create"
      ? [
          { required: true, message: "请输入登录密码", trigger: ["input", "blur"] },
          { min: 6, message: "密码长度不能少于 6 位", trigger: ["input", "blur"] },
        ]
      : [],
  phone: [
    {
      validator: (_rule, value: string) => {
        const phone = value?.trim();
        if (!phone) return true;
        return PHONE_PATTERN.test(phone);
      },
      message: "手机号格式不正确",
      trigger: ["input", "blur"],
    },
  ],
  email: [
    {
      validator: (_rule, value: string) => {
        const email = value?.trim();
        if (!email) return true;
        return EMAIL_PATTERN.test(email);
      },
      message: "邮箱格式不正确",
      trigger: ["input", "blur"],
    },
  ],
}));

/** 将后端 IDept 树递归转为 NTreeSelect 所需的 TreeSelectOption */
const toTreeOptions = (nodes: IDept[]): TreeSelectOption[] => {
  return nodes.map((node) => ({
    key: node.id,
    label: node.deptName,
    children: node.children?.length ? toTreeOptions(node.children) : undefined,
  }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => toTreeOptions(deptTree.value));

const loadDeptTree = async () => {
  try {
    deptLoading.value = true;
    deptTree.value = await GetDeptTree();
  } catch {
    deptTree.value = [];
  } finally {
    deptLoading.value = false;
  }
};

/** 加载启用状态的角色列表 */
const loadRoleOptions = async () => {
  try {
    roleLoading.value = true;
    const { rows } = await GetRoleList({ pageNum: 1, pageSize: 100, status: "enabled" });
    roleOptions.value = rows.map((role) => ({
      value: role.id,
      label: role.roleName,
    }));
  } catch {
    roleOptions.value = [];
  } finally {
    roleLoading.value = false;
  }
};

/** 加载启用状态的岗位列表 */
const loadPostOptions = async () => {
  try {
    postLoading.value = true;
    const { rows } = await GetPostList({ pageNum: 1, pageSize: 100, status: "enabled" });
    postOptions.value = rows.map((post) => ({
      value: post.id,
      label: post.postName,
    }));
  } catch {
    postOptions.value = [];
  } finally {
    postLoading.value = false;
  }
};

/** 编辑模式下若未拉到详情，降级用列表行数据（角色 / 岗位可能为空数组） */
const fillFormFromRecord = (data: IUserModalData) => {
  if (data.mode === "edit" && data.record) {
    formModel.value = {
      account: data.record.account,
      password: "",
      username: data.record.username ?? "",
      phone: data.record.phone ?? "",
      email: data.record.email ?? "",
      gender: data.record.gender,
      deptId: data.record.deptId,
      status: data.record.status,
      remark: data.record.remark ?? "",
      roleIds: [],
      postIds: [],
    };
    return;
  }

  formModel.value = createDefaultForm();
};

/** 弹窗打开：并行加载下拉数据，再按模式初始化表单 */
async function handleOpened(data: IUserModalData) {
  await Promise.all([loadDeptTree(), loadRoleOptions(), loadPostOptions()]);

  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  try {
    const user = await GetUserById(data.record.id);
    formModel.value = {
      account: user.account,
      password: "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      gender: user.gender,
      deptId: user.deptId,
      status: user.status,
      remark: user.remark ?? "",
      roleIds: user.roles.map((item) => item.id),
      postIds: user.posts.map((item) => item.id),
    };
  } catch {
    fillFormFromRecord(data);
  }
}

/**
 * 将 formModel 转为 API 所需结构。
 * 新增时额外获取公钥并对密码 RSA 加密
 */
const buildPayload = async (): Promise<ICreateUserParams | IUpdateUserParams | null> => {
  const payload: IUpdateUserParams = {
    account: formModel.value.account.trim(),
    username: formModel.value.username.trim() || undefined,
    phone: formModel.value.phone.trim() || undefined,
    email: formModel.value.email.trim() || undefined,
    gender: formModel.value.gender,
    deptId: formModel.value.deptId ?? undefined,
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
    roleIds: formModel.value.roleIds,
    postIds: formModel.value.postIds,
  };

  if (mode.value === "create") {
    const password = formModel.value.password.trim();
    const publicKey = await GetPublicEncryptKey();
    const encryptedPassword = Encrypt(password, publicKey);
    if (!encryptedPassword) {
      message.error("密码加密失败");
      return null;
    }

    return {
      ...payload,
      password: encryptedPassword,
    } as ICreateUserParams;
  }

  return payload;
};

/** 点击"确定"：校验 -> 构建参数（含密码加密） -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload = await buildPayload();
  if (!payload) return;

  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateUser(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateUser(payload as ICreateUserParams);
      message.success("新增成功");
    }

    modalApi.close();
    emit("success");
  } catch {
    // 错误提示由响应拦截器统一处理
  } finally {
    modalApi.unlock();
  }
}
</script>

<style scoped></style>
