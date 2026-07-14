<!-- 角色管理 -> 新增 / 编辑表单（useModal 内容方：弹窗外壳由 useModal 提供，这里只写表单与权限树） -->

<template>
  <Modal>
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
              <NRadio v-for="item in CommonStatusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="数据权限" path="dataScope">
          <NSelect
            v-model:value="formModel.dataScope"
            :options="DataScopeOptions"
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
  </Modal>
</template>

<script setup lang="ts">
import { CreateRole, GetDeptTree, GetMenuTree, GetRoleById, UpdateRole } from "@/api/system-management";
import type { CommonStatus, DataScope, ICreateRoleParams, IDept, IMenu, IUpdateRoleParams } from "@/api/types";
import { useModal } from "@/hooks";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
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
import { CommonStatusOptions, DataScopeOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IRoleModalData } from "../data";

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

const emit = defineEmits<{
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const deptLoading = ref(false);
const menuLoading = ref(false);
const deptTree = ref<IDept[]>([]);
const menuTree = ref<IMenu[]>([]);
const formModel = ref<RoleFormModel>(createDefaultForm());
const menuExpandedKeys = ref<Array<string | number>>([]);
const deptExpandedKeys = ref<Array<string | number>>([]);

const [Modal, modalApi] = useModal<IRoleModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑角色" : "新增角色"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
    menuExpandedKeys.value = [];
    deptExpandedKeys.value = [];
  },
});

const mode = computed(() => modalApi.getData()?.mode ?? "create");

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

/** 编辑模式回填：优先详情接口，失败降级用列表行数据 */
const fillFormFromRecord = (data: IRoleModalData) => {
  if (data.mode === "edit" && data.record) {
    formModel.value = {
      roleKey: data.record.roleKey,
      roleName: data.record.roleName,
      roleSort: data.record.roleSort ?? 0,
      dataScope: data.record.dataScope,
      status: data.record.status,
      remark: data.record.remark ?? "",
      menuIds: data.record.menuIds,
      deptIds: data.record.deptIds,
    };
    return;
  }

  formModel.value = createDefaultForm();
};

/** 弹窗打开：先并行加载两棵权限树，再按模式回填表单 */
async function handleOpened(data: IRoleModalData) {
  await Promise.all([loadDeptTree(), loadMenuTree()]);

  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  try {
    const role = await GetRoleById(data.record.id);
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
    fillFormFromRecord(data);
  }
}

/** 点击"确定"：校验 -> 业务校验 -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (formModel.value.dataScope === "custom" && formModel.value.deptIds.length === 0) {
    message.warning("请选择自定义数据范围");
    return;
  }

  const payload: ICreateRoleParams | IUpdateRoleParams = {
    roleKey: formModel.value.roleKey.trim(),
    roleName: formModel.value.roleName.trim(),
    roleSort: formModel.value.roleSort,
    dataScope: formModel.value.dataScope,
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
    menuIds: formModel.value.menuIds,
    // 非自定义范围时不提交部门勾选，避免残留脏数据
    deptIds: formModel.value.dataScope === "custom" ? formModel.value.deptIds : [],
  };

  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateRole(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateRole(payload as ICreateRoleParams);
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
