<!--
  用户管理 -> 新增 / 编辑表单（弹窗）

  通过 v-model:show 控制显隐，mode 区分 create / edit。
  打开时会并行加载部门树、角色、岗位；编辑模式额外拉取用户详情。
-->

<template>
  <!-- #region 弹窗与表单 -->
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw"
    :title="mode === 'create' ? '新增用户' : '编辑用户'"
    :mask-closable="false"
    :show-icon="false"
    content-class=" my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
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
              <NRadio v-for="item in genderOptions" :key="item.value" :value="item.value">
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
              <NRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
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

    <!-- 底部操作按钮 -->
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
import { CreateUser, GetDeptTree, GetPostList, GetRoleList, GetUserById, UpdateUser } from "@/api/system-management";
import type { CommonStatus, Gender, ICreateUserParams, IDept, IUpdateUserParams } from "@/api/types";
import { Encrypt } from "@/utils";
import Checkmark24Regular from "@vicons/fluent/es/Checkmark24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
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
import { computed, ref, watch } from "vue";
import { genderOptions, statusOptions, type IUserRow } from "../data";
// #endregion

// #region 常量与校验规则
/** 中国大陆手机号正则 */
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
/** 简单邮箱格式校验 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// #endregion

// #region 表单数据模型
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
// #endregion

// #region 组件通信（Props / Emits / v-model）
const props = defineProps<{
  mode: "create" | "edit";
  record?: IUserRow | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

// 与父组件双向绑定弹窗显隐：v-model:show
const visible = defineModel<boolean>("show", { required: true });
// #endregion

// #region 响应式状态
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const deptLoading = ref(false);
const roleLoading = ref(false);
const postLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const roleOptions = ref<SelectOption[]>([]);
const postOptions = ref<SelectOption[]>([]);
const formModel = ref<UserFormModel>(createDefaultForm());
// #endregion

// #region 表单校验规则
// 编辑模式下不校验 password；手机号 / 邮箱为空时不强制，有值则校验格式
const rules = computed<FormRules>(() => ({
  account: [{ required: true, message: "请输入登录账号", trigger: ["input", "blur"] }],
  password:
    props.mode === "create"
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
// #endregion

// #region 部门树数据转换
/** 将后端 IDept 树递归转为 NTreeSelect 所需的 TreeSelectOption */
const toTreeOptions = (nodes: IDept[]): TreeSelectOption[] => {
  return nodes.map((node) => ({
    key: node.id,
    label: node.deptName,
    children: node.children?.length ? toTreeOptions(node.children) : undefined,
  }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => toTreeOptions(deptTree.value));
// #endregion

// #region 加载下拉数据
/** 加载部门树 */
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
// #endregion

// #region 编辑模式 - 加载用户详情
/** 根据 id 拉取完整用户信息并回填表单（含角色、岗位） */
const loadUserDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const user = await GetUserById(props.record.id);
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
    // 详情接口失败时，降级使用列表行数据
    resetFormFromRecord();
  }
};
// #endregion

// #region 表单重置
/**
 * 用列表行数据或默认值填充表单
 * 编辑模式下若未拉到详情，角色/岗位可能为空数组
 */
const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      account: props.record.account,
      password: "",
      username: props.record.username ?? "",
      phone: props.record.phone ?? "",
      email: props.record.email ?? "",
      gender: props.record.gender,
      deptId: props.record.deptId,
      status: props.record.status,
      remark: props.record.remark ?? "",
      roleIds: [],
      postIds: [],
    };
    return;
  }

  formModel.value = createDefaultForm();
};
// #endregion

// #region 构建提交参数
/**
 * 将 formModel 转为 API 所需结构
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

  if (props.mode === "create") {
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
// #endregion

// #region 弹窗交互
/** 关闭弹窗 */
const handleCancel = () => {
  visible.value = false;
};

/** 弹窗完全关闭后：清除校验状态并重置表单，避免下次打开残留数据 */
const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
};
// #endregion

// #region 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload = await buildPayload();
  if (!payload) return;

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateUser(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateUser(payload as ICreateUserParams);
      message.success("新增成功");
    }

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
// 每次打开：先加载选项数据，再按模式初始化表单
watch(
  () => visible.value,
  async (show) => {
    if (!show) return;

    await Promise.all([loadDeptTree(), loadRoleOptions(), loadPostOptions()]);

    if (props.mode === "edit") {
      await loadUserDetail();
    } else {
      resetFormFromRecord();
    }
  },
);
// #endregion
</script>

<style scoped></style>
