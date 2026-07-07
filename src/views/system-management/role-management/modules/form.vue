<!-- 角色管理 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: min(1200px, calc(100vw - 32px))"
    :title="mode === 'create' ? '新增角色' : '编辑角色'"
    :mask-closable="false"
    :show-icon="false"
    content-class="my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
    <div class="grid grid-cols-3 gap-6 min-h-[420px]">
      <!-- 左侧：基础表单 -->
      <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80" class="min-w-0">
        <NFormItem label="角色名称" path="roleName">
          <NInput v-model:value="formModel.roleName" placeholder="请输入角色名称" maxlength="50" show-count />
        </NFormItem>
        <NFormItem label="角色编码" path="roleCode">
          <NInput
            v-model:value="formModel.roleCode"
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
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </NFormItem>
      </NForm>

      <!-- 中间：菜单权限 -->
      <div class="flex flex-col min-w-0 min-h-0">
        <div class="text-sm font-medium mb-2 shrink-0">菜单权限</div>
        <NTree
          v-model:checked-keys="formModel.menuIds"
          :data="menuTreeOptions"
          :loading="menuLoading"
          checkable
          cascade
          key-field="key"
          label-field="label"
          children-field="children"
          default-expand-all
          block-line
          class="flex-1 overflow-auto"
        />
      </div>

      <!-- 右侧：数据范围 -->
      <div class="flex flex-col min-w-0 min-h-0">
        <div class="text-sm font-medium mb-2 shrink-0">数据范围</div>
        <NTree
          v-if="formModel.dataScope === 2"
          v-model:checked-keys="formModel.deptIds"
          :data="deptTreeOptions"
          :loading="deptLoading"
          checkable
          cascade
          key-field="key"
          label-field="label"
          children-field="children"
          default-expand-all
          block-line
          class="flex-1 overflow-auto"
        />
        <NEmpty v-else description="请选择「自定义数据权限」后配置数据范围" class="flex-1 justify-center" />
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
import type { ICreateRoleParams, IDept, IMenu, IUpdateRoleParams } from "@/api/types";
import Checkmark24Regular from "@vicons/fluent/es/Checkmark24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import {
  NButton,
  NEmpty,
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
  NTree,
  useMessage,
  type FormInst,
  type FormRules,
  type TreeOption,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { dataScopeOptions, statusOptions, type IRoleRow } from "../data";

interface RoleFormModel {
  roleCode: string;
  roleName: string;
  roleSort: number;
  dataScope: number;
  status: number;
  remark: string;
  menuIds: number[];
  deptIds: number[];
}

const createDefaultForm = (): RoleFormModel => ({
  roleCode: "",
  roleName: "",
  roleSort: 0,
  dataScope: 1,
  status: 1,
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

const rules = computed<FormRules>(() => ({
  roleName: [{ required: true, message: "请输入角色名称", trigger: ["input", "blur"] }],
  roleCode: [{ required: true, message: "请输入角色编码", trigger: ["input", "blur"] }],
}));

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

const loadMenuTree = async () => {
  try {
    menuLoading.value = true;
    menuTree.value = await GetMenuTree();
  } catch {
    menuTree.value = [];
  } finally {
    menuLoading.value = false;
  }
};

const loadRoleDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const role = await GetRoleById(props.record.id);
    formModel.value = {
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleSort: role.roleSort ?? 0,
      dataScope: role.dataScope ?? 1,
      status: role.status,
      remark: role.remark ?? "",
      menuIds: role.roleMenus?.map((item) => item.menuId) ?? [],
      deptIds: role.roleDepts?.map((item) => item.deptId) ?? [],
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      roleCode: props.record.roleCode,
      roleName: props.record.roleName,
      roleSort: props.record.roleSort ?? 0,
      dataScope: props.record.dataScope ?? 1,
      status: props.record.status,
      remark: props.record.remark ?? "",
      menuIds: [],
      deptIds: [],
    };
    return;
  }

  formModel.value = createDefaultForm();
};

const buildPayload = (): ICreateRoleParams | IUpdateRoleParams => ({
  roleCode: formModel.value.roleCode.trim(),
  roleName: formModel.value.roleName.trim(),
  roleSort: formModel.value.roleSort,
  dataScope: formModel.value.dataScope,
  status: formModel.value.status,
  remark: formModel.value.remark.trim() || undefined,
  menuIds: formModel.value.menuIds,
  deptIds: formModel.value.dataScope === 2 ? formModel.value.deptIds : [],
});

const handleCancel = () => {
  visible.value = false;
};

const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
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
