<!-- 部门管理 -> 新增 / 编辑表单（useModal 内容方） -->

<template>
  <Modal>
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
      <NFormItem label="部门编码" path="deptCode">
        <NInput v-model:value="formModel.deptCode" placeholder="请输入部门编码" maxlength="64" show-count />
      </NFormItem>
      <NFormItem label="显示顺序" path="sort">
        <NInputNumber v-model:value="formModel.sort" class="w-full" placeholder="请输入显示顺序" :min="0" />
      </NFormItem>
      <NFormItem label="负责人" path="leaderUserId">
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
            <NRadio v-for="item in CommonStatusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>
    </NForm>
  </Modal>
</template>

<script setup lang="ts">
import { CreateDept, GetAllUsers, GetDeptTree, UpdateDept } from "@/api/system-management";
import type { ICreateDeptParams, IDept, IUserOption } from "@/api/types";
import { useModal } from "@/hooks";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
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
import { CommonStatusOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IDeptModalData } from "../data";

interface LeaderOption extends SelectOption {
  value: string;
  label: string;
  leaderName: string;
}

const createDefaultForm = (): ICreateDeptParams => ({
  parentId: null,
  deptName: "",
  deptCode: "",
  sort: 0,
  leaderUserId: undefined,
  phone: "",
  email: "",
  status: "enabled",
});

const emit = defineEmits<{
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const treeLoading = ref(false);
const userLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const userList = ref<IUserOption[]>([]);
const selectedLeaderId = ref<string | null>(null);
const formModel = ref<ICreateDeptParams>(createDefaultForm());

const [Modal, modalApi] = useModal<IDeptModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑部门" : "新增部门"),
  // 原表单用的是 card 预设，保持外观不变
  preset: "card",
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
    selectedLeaderId.value = null;
    userList.value = [];
  },
});

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
  })),
);

const rules: FormRules = {
  deptName: [{ required: true, message: "请输入部门名称", trigger: ["input", "blur"] }],
  deptCode: [{ required: true, message: "请输入部门编码", trigger: ["input", "blur"] }],
  email: [{ type: "email", message: "邮箱格式不正确", trigger: ["input", "blur"] }],
};

/** 上级部门树选项：编辑时排除自己（不能把自己挂到自己下面） */
const toTreeOptions = (nodes: IDept[], excludeId?: string): TreeSelectOption[] => {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      key: node.id,
      label: node.deptName,
      children: node.children?.length ? toTreeOptions(node.children, excludeId) : undefined,
    }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => {
  const data = modalApi.getData();
  const children = toTreeOptions(deptTree.value, data?.mode === "edit" ? data.record?.id : undefined);

  return [
    {
      key: "root",
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

const handleLeaderChange = (userId: string | null) => {
  if (!userId) {
    formModel.value.leaderUserId = undefined;
    return;
  }

  const user = userOptions.value.find((item) => item.value === userId);
  if (!user) return;

  formModel.value.leaderUserId = user.value;
};

/** 弹窗打开：并行加载部门树与用户列表，再按模式回填表单 */
async function handleOpened(data: IDeptModalData) {
  await Promise.all([loadDeptTree(), loadUsers()]);

  if (data?.mode === "edit" && data.record) {
    formModel.value = {
      parentId: data.record.parentId,
      deptName: data.record.deptName,
      deptCode: data.record.deptCode,
      sort: data.record.sort,
      leaderUserId: data.record.leaderUserId ?? undefined,
      phone: data.record.phone ?? "",
      email: data.record.email ?? "",
      status: data.record.status,
    };
    selectedLeaderId.value = data.record.leaderUserId;
    return;
  }

  formModel.value = createDefaultForm();
  selectedLeaderId.value = null;
}

/** 点击"确定"：校验 -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload: ICreateDeptParams = {
    parentId: formModel.value.parentId,
    deptName: formModel.value.deptName.trim(),
    deptCode: formModel.value.deptCode.trim(),
    sort: formModel.value.sort ?? 0,
    status: formModel.value.status ?? "enabled",
  };

  const phone = formModel.value.phone?.trim();
  const email = formModel.value.email?.trim();

  if (formModel.value.leaderUserId) payload.leaderUserId = formModel.value.leaderUserId;
  if (phone) payload.phone = phone;
  if (email) payload.email = email;

  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateDept(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDept(payload);
      message.success("新增成功");
    }

    modalApi.close();
    emit("success");
  } catch {
    // 错误提示由响应拦截器处理
  } finally {
    modalApi.unlock();
  }
}
</script>

<style scoped></style>
