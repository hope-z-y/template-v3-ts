<!-- 部门管理 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    style="width: 40vw"
    :title="mode === 'create' ? '新增部门' : '编辑部门'"
    :mask-closable="false"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="上级部门" path="parentId">
        <NTreeSelect
          v-model:value="formModel.parentId"
          :options="deptTreeOptions"
          :loading="treeLoading"
          placeholder="请选择上级部门"
          clearable
          default-expand-all
          key-field="key"
          label-field="label"
          children-field="children"
        />
      </NFormItem>
      <NFormItem label="部门名称" path="deptName">
        <NInput v-model:value="formModel.deptName" placeholder="请输入部门名称" maxlength="50" show-count />
      </NFormItem>
      <NFormItem label="显示顺序" path="sort">
        <NInputNumber v-model:value="formModel.sort" class="w-full" placeholder="请输入显示顺序" :min="0" />
      </NFormItem>
      <NFormItem label="负责人" path="leader">
        <NSelect
          v-model:value="selectedLeaderId"
          :options="userOptions"
          :loading="userLoading"
          placeholder="请选择负责人"
          filterable
          clearable
          @update:value="handleLeaderChange"
        />
      </NFormItem>
      <NFormItem label="联系电话" path="phone">
        <NInput v-model:value="formModel.phone" placeholder="请输入联系电话" maxlength="20" />
      </NFormItem>
      <NFormItem label="邮箱" path="email">
        <NInput v-model:value="formModel.email" placeholder="请输入邮箱" maxlength="50" />
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
    </NForm>

    <template #footer>
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
</template>

<script setup lang="ts">
import { CreateDept, GetAllUsers, GetDeptTree, UpdateDept } from "@/api/system-management";
import type { ICreateDeptParams, IDept, IUserOption } from "@/api/types";
import Checkmark24Regular from "@vicons/fluent/es/Checkmark24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
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

interface LeaderOption extends SelectOption {
  value: number;
  label: string;
  leaderName: string;
  phone?: string;
  email?: string;
}

const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
] as const;

const createDefaultForm = (): ICreateDeptParams => ({
  parentId: 0,
  deptName: "",
  sort: 0,
  leader: "",
  phone: "",
  email: "",
  status: 1,
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IDept | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const treeLoading = ref(false);
const userLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const userList = ref<IUserOption[]>([]);
const selectedLeaderId = ref<number | null>(null);
const formModel = ref<ICreateDeptParams>(createDefaultForm());

const getUserDisplayName = (user: IUserOption) => user.username?.trim() || user.account;

const getUserOptionLabel = (user: IUserOption) => {
  const displayName = getUserDisplayName(user);
  return displayName === user.account ? displayName : `${displayName}（${user.account}）`;
};

const userOptions = computed<LeaderOption[]>(() =>
  userList.value.map((user) => ({
    value: user.id,
    label: getUserOptionLabel(user),
    leaderName: getUserDisplayName(user),
    phone: user.phone,
    email: user.email,
  })),
);

const findLeaderUserId = (leader?: string | null) => {
  const name = leader?.trim();
  if (!name) return null;

  const matched = userList.value.find((user) => getUserDisplayName(user) === name || user.account === name);
  return matched?.id ?? null;
};

const rules: FormRules = {
  parentId: [{ required: true, type: "number", message: "请选择上级部门", trigger: ["change", "blur"] }],
  deptName: [{ required: true, message: "请输入部门名称", trigger: ["input", "blur"] }],
  email: [{ type: "email", message: "邮箱格式不正确", trigger: ["input", "blur"] }],
};

const toTreeOptions = (nodes: IDept[], excludeId?: number): TreeSelectOption[] => {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      key: node.id,
      label: node.deptName,
      children: node.children?.length ? toTreeOptions(node.children, excludeId) : undefined,
    }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => {
  const children = toTreeOptions(deptTree.value, props.mode === "edit" ? props.record?.id : undefined);

  return [
    {
      key: 0,
      label: "顶级部门",
      children: children.length ? children : undefined,
    },
  ];
});

const loadDeptTree = async () => {
  try {
    treeLoading.value = true;
    deptTree.value = await GetDeptTree();
  } catch {
    deptTree.value = [];
  } finally {
    treeLoading.value = false;
  }
};

const loadUsers = async () => {
  try {
    userLoading.value = true;
    userList.value = await GetAllUsers();
  } catch {
    userList.value = [];
  } finally {
    userLoading.value = false;
  }
};

const handleLeaderChange = (userId: number | null) => {
  if (!userId) {
    formModel.value.leader = "";
    formModel.value.phone = "";
    formModel.value.email = "";
    return;
  }

  const user = userOptions.value.find((item) => item.value === userId);
  if (!user) return;

  formModel.value.leader = user.leaderName;
  formModel.value.phone = user.phone ?? "";
  formModel.value.email = user.email ?? "";
};

const resetForm = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      parentId: props.record.parentId,
      deptName: props.record.deptName,
      sort: props.record.sort,
      leader: props.record.leader ?? "",
      phone: props.record.phone ?? "",
      email: props.record.email ?? "",
      status: props.record.status,
    };
    selectedLeaderId.value = findLeaderUserId(props.record.leader);
    return;
  }

  formModel.value = createDefaultForm();
  selectedLeaderId.value = null;
};

const handleCancel = () => {
  visible.value = false;
};

const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
  selectedLeaderId.value = null;
  userList.value = [];
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload: ICreateDeptParams = {
    parentId: formModel.value.parentId,
    deptName: formModel.value.deptName.trim(),
    sort: formModel.value.sort ?? 0,
    status: formModel.value.status ?? 1,
  };

  const leader = formModel.value.leader?.trim();
  const phone = formModel.value.phone?.trim();
  const email = formModel.value.email?.trim();

  if (leader) payload.leader = leader;
  if (phone) payload.phone = phone;
  if (email) payload.email = email;

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateDept(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDept(payload);
      message.success("新增成功");
    }

    visible.value = false;
    emit("success");
  } catch {
    // 错误提示由响应拦截器处理
  } finally {
    submitting.value = false;
  }
};

watch(
  () => visible.value,
  async (show) => {
    if (!show) return;

    await Promise.all([loadDeptTree(), loadUsers()]);
    resetForm();
  },
);
</script>

<style scoped></style>
