<!-- 角色管理 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw"
    :title="mode === 'create' ? '新增角色' : '编辑角色'"
    :mask-closable="false"
    :show-icon="false"
    content-class="my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
    <div class="flex gap-4 h-[min(560px,calc(100vh-220px))]">
      <!-- 左侧：基础信息 -->
      <NForm
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="80"
        class="w-85 shrink-0 overflow-y-auto pr-1"
      >
        <NFormItem label="角色名称" path="roleName">
          <NInput v-model:value="formModel.roleName" placeholder="请输入角色名称" maxlength="50" show-count />
        </NFormItem>
        <NFormItem label="角色标识" path="roleKey">
          <NInput
            v-model:value="formModel.roleKey"
            placeholder="请输入角色编码，如 admin"
            maxlength="50"
            show-count
            :disabled="mode === 'edit'"
          />
        </NFormItem>
        <NFormItem label="显示顺序" path="roleSort">
          <NInputNumber v-model:value="formModel.roleSort" class="w-full" placeholder="请输入显示顺序" :min="0" />
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
        <NFormItem label="数据权限" path="dataScope">
          <NSelect
            v-model:value="formModel.dataScope"
            :options="dataScopeOptions"
            placeholder="请选择数据权限"
            class="w-full"
          />
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput
            v-model:value="formModel.remark"
            type="textarea"
            placeholder="请输入备注"
            maxlength="500"
            show-count
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </NFormItem>
      </NForm>

      <div class="w-px self-stretch shrink-0 bg-black/8 dark:bg-white/10" />

      <!-- 右侧：权限配置 -->
      <div class="flex-1 min-w-0 min-h-0 grid gap-4" :class="showDeptScope ? 'grid-cols-2' : 'grid-cols-1'">
        <!-- 菜单权限 -->
        <div class="flex flex-col min-h-0 min-w-0 rounded-md overflow-hidden shadow-md">
          <div class="flex items-center justify-between gap-2 shrink-0 px-3 py-2 bg-black/3 dark:bg-white/5">
            <span class="text-sm font-medium">菜单权限</span>
            <NSpace :size="8">
              <NButton text type="primary" size="tiny" @click="expandMenuAll(true)">展开</NButton>
              <NButton text type="primary" size="tiny" @click="expandMenuAll(false)">折叠</NButton>
            </NSpace>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto p-2">
            <NSpin :show="menuLoading">
              <NTree
                v-model:checked-keys="formModel.menuIds"
                v-model:expanded-keys="menuExpandedKeys"
                :data="menuTreeOptions"
                checkable
                cascade
                key-field="key"
                label-field="label"
                children-field="children"
                block-line
              />
            </NSpin>
          </div>
        </div>

        <!-- 数据范围：仅自定义数据权限时展示 -->
        <div v-if="showDeptScope" class="flex flex-col min-h-0 min-w-0 rounded-md overflow-hidden shadow-md">
          <div class="flex items-center justify-between gap-2 shrink-0 px-3 py-2 bg-black/3 dark:bg-white/5">
            <span class="text-sm font-medium">数据范围</span>
            <NSpace :size="8">
              <NButton text type="primary" size="tiny" @click="expandDeptAll(true)">展开</NButton>
              <NButton text type="primary" size="tiny" @click="expandDeptAll(false)">折叠</NButton>
            </NSpace>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto p-2">
            <NSpin :show="deptLoading">
              <NTree
                v-model:checked-keys="formModel.deptIds"
                v-model:expanded-keys="deptExpandedKeys"
                :data="deptTreeOptions"
                checkable
                cascade
                key-field="key"
                label-field="label"
                children-field="children"
                block-line
              />
            </NSpin>
          </div>
        </div>
      </div>
    </div>

    <template #action>
      <div class="flex justify-end gap-2">
        <NButton @click="handleCancel">
          <template #icon>
            <NIcon><Dismiss24Regular /></NIcon>
          </template>
          取消
        </NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          <template #icon>
            <NIcon><Checkmark24Regular /></NIcon>
          </template>
          确定
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { CreateRole, GetDeptTree, GetMenuTree, GetRoleById, UpdateRole } from "@/api/system-management";
import type { CommonStatus, DataScope, ICreateRoleParams, IDept, IMenu, IUpdateRoleParams } from "@/api/types";
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
  NSpin,
  NTree,
  useMessage,
  type FormInst,
  type FormRules,
  type TreeOption,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { dataScopeOptions, statusOptions, type IRoleRow } from "../data";

interface RoleFormModel {
  roleKey: string;
  roleName: string;
  roleSort: number;
  dataScope: DataScope;
  status: CommonStatus;
  remark: string;
  menuIds: string[];
  deptIds: string[];
}

const createDefaultForm = (): RoleFormModel => ({
  roleKey: "",
  roleName: "",
  roleSort: 0,
  dataScope: "all",
  status: "enabled",
  remark: "",
  menuIds: [],
  deptIds: [],
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IRoleRow | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const deptLoading = ref(false);
const menuLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const menuTree = ref<IMenu[]>([]);
const formModel = ref<RoleFormModel>(createDefaultForm());
const menuExpandedKeys = ref<Array<string | number>>([]);
const deptExpandedKeys = ref<Array<string | number>>([]);

const showDeptScope = computed(() => formModel.value.dataScope === "custom");

const rules = computed<FormRules>(() => ({
  roleName: [{ required: true, message: "请输入角色名称", trigger: ["input", "blur"] }],
  roleKey: [{ required: true, message: "请输入角色标识", trigger: ["input", "blur"] }],
}));

const collectTreeKeys = (nodes: TreeOption[]): Array<string | number> => {
  const keys: Array<string | number> = [];

  const walk = (list: TreeOption[]) => {
    list.forEach((node) => {
      if (node.key !== undefined && node.key !== null) {
        keys.push(node.key);
      }
      if (node.children?.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);
  return keys;
};

const toDeptTreeOptions = (nodes: IDept[]): TreeOption[] =>
  nodes.map((node) => ({
    key: node.id,
    label: node.deptName,
    children: node.children?.length ? toDeptTreeOptions(node.children) : undefined,
  }));

const toMenuTreeOptions = (menus: IMenu[]): TreeOption[] =>
  menus.map((menu) => ({
    key: menu.id,
    label: menu.menuName,
    children: menu.children?.length ? toMenuTreeOptions(menu.children) : undefined,
  }));

const deptTreeOptions = computed<TreeOption[]>(() => toDeptTreeOptions(deptTree.value));
const menuTreeOptions = computed<TreeOption[]>(() => toMenuTreeOptions(menuTree.value));

const expandMenuAll = (expand: boolean) => {
  menuExpandedKeys.value = expand ? collectTreeKeys(menuTreeOptions.value) : [];
};

const expandDeptAll = (expand: boolean) => {
  deptExpandedKeys.value = expand ? collectTreeKeys(deptTreeOptions.value) : [];
};

const loadDeptTree = async () => {
  try {
    deptLoading.value = true;
    deptTree.value = await GetDeptTree();
    deptExpandedKeys.value = collectTreeKeys(toDeptTreeOptions(deptTree.value));
  } catch {
    deptTree.value = [];
    deptExpandedKeys.value = [];
  } finally {
    deptLoading.value = false;
  }
};

const loadMenuTree = async () => {
  try {
    menuLoading.value = true;
    menuTree.value = await GetMenuTree();
    menuExpandedKeys.value = collectTreeKeys(toMenuTreeOptions(menuTree.value));
  } catch {
    menuTree.value = [];
    menuExpandedKeys.value = [];
  } finally {
    menuLoading.value = false;
  }
};

const loadRoleDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const role = await GetRoleById(props.record.id);
    formModel.value = {
      roleKey: role.roleKey,
      roleName: role.roleName,
      roleSort: role.roleSort ?? 0,
      dataScope: role.dataScope,
      status: role.status,
      remark: role.remark ?? "",
      menuIds: role.menuIds,
      deptIds: role.deptIds,
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      roleKey: props.record.roleKey,
      roleName: props.record.roleName,
      roleSort: props.record.roleSort ?? 0,
      dataScope: props.record.dataScope,
      status: props.record.status,
      remark: props.record.remark ?? "",
      menuIds: props.record.menuIds,
      deptIds: props.record.deptIds,
    };
    return;
  }

  formModel.value = createDefaultForm();
};

const buildPayload = (): ICreateRoleParams | IUpdateRoleParams => ({
  roleKey: formModel.value.roleKey.trim(),
  roleName: formModel.value.roleName.trim(),
  roleSort: formModel.value.roleSort,
  dataScope: formModel.value.dataScope,
  status: formModel.value.status,
  remark: formModel.value.remark.trim() || undefined,
  menuIds: formModel.value.menuIds,
  deptIds: formModel.value.dataScope === "custom" ? formModel.value.deptIds : [],
});

const handleCancel = () => {
  visible.value = false;
};

const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
  menuExpandedKeys.value = [];
  deptExpandedKeys.value = [];
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (formModel.value.dataScope === "custom" && formModel.value.deptIds.length === 0) {
    message.warning("请选择自定义数据范围");
    return;
  }

  const payload = buildPayload();

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateRole(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateRole(payload as ICreateRoleParams);
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

watch(
  () => visible.value,
  async (show) => {
    if (!show) return;

    await Promise.all([loadDeptTree(), loadMenuTree()]);

    if (props.mode === "edit") {
      await loadRoleDetail();
    } else {
      resetFormFromRecord();
    }
  },
);
</script>

<style scoped></style>
