<!-- 菜单管理 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw"
    :title="mode === 'create' ? '新增菜单' : '编辑菜单'"
    :mask-closable="false"
    :show-icon="false"
    content-class="my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">
      <div class="grid grid-cols-2 gap-x-4">
        <NFormItem label="上级菜单" path="parentId">
          <NTreeSelect
            v-model:value="formModel.parentId"
            :options="menuTreeOptions"
            :loading="menuLoading"
            placeholder="请选择上级菜单，如：根目录"
            clearable
            default-expand-all
            key-field="key"
            label-field="label"
            children-field="children"
          />
        </NFormItem>
        <NFormItem label="菜单类型" path="menuType">
          <NRadioGroup v-model:value="formModel.menuType">
            <NRadioButton v-for="item in menuTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="菜单名称" path="menuName">
          <NInput
            v-model:value="formModel.menuName"
            placeholder="请输入菜单名称，如：用户管理"
            maxlength="50"
            show-count
          />
        </NFormItem>
        <NFormItem label="显示顺序" path="sort">
          <NInputNumber v-model:value="formModel.sort" class="w-full" placeholder="请输入显示顺序，如：1" :min="0" />
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

        <template v-if="formModel.menuType !== 'button'">
          <NFormItem label="路由地址" path="routePath">
            <NInput
              v-model:value="formModel.routePath"
              placeholder="请输入路由地址，如：/system-management/user-management"
              maxlength="200"
            />
          </NFormItem>
          <NFormItem label="菜单图标" path="icon">
            <IconPicker v-model:value="formModel.icon" />
          </NFormItem>
          <NFormItem label="显示状态" path="visible">
            <NRadioGroup v-model:value="formModel.visible">
              <NSpace>
                <NRadio v-for="item in visibleOptions" :key="String(item.value)" :value="item.value">
                  {{ item.label }}
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItem>
        </template>

        <template v-if="formModel.menuType === 'menu'">
          <NFormItem label="组件路径" path="component">
            <NInput
              v-model:value="formModel.component"
              placeholder="请输入组件路径，如：system-management/user-management/index"
              maxlength="200"
            />
          </NFormItem>
          <NFormItem label="外链地址" path="externalLink">
            <NInput v-model:value="formModel.externalLink" placeholder="请输入外链地址（可选）" maxlength="500" />
          </NFormItem>
          <NFormItem label="是否缓存" path="cacheable">
            <NRadioGroup v-model:value="formModel.cacheable">
              <NSpace>
                <NRadio v-for="item in isCacheOptions" :key="String(item.value)" :value="item.value">
                  {{ item.label }}
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItem>
        </template>

        <NFormItem v-if="formModel.menuType === 'button'" label="权限标识" path="permissionCode" class="col-span-2">
          <NInput
            v-model:value="formModel.permissionCode"
            placeholder="请输入权限标识，如：system:user:create"
            maxlength="100"
          />
        </NFormItem>
      </div>
    </NForm>

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
import { CreateMenu, GetMenuById, GetMenuTree, UpdateMenu } from "@/api/system-management";
import type { CommonStatus, ICreateMenuParams, IMenu, IUpdateMenuParams, MenuType } from "@/api/types";
import { IconPicker } from "@/components";
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
  NRadioButton,
  NRadioGroup,
  NSpace,
  NTreeSelect,
  useMessage,
  type FormInst,
  type FormRules,
  type TreeSelectOption,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { isCacheOptions, menuTypeOptions, statusOptions, visibleOptions } from "../data";

interface MenuFormModel {
  parentId: string | null;
  menuType: MenuType;
  menuName: string;
  permissionCode: string;
  routePath: string;
  component: string;
  externalLink: string;
  icon: string;
  sort: number;
  visible: boolean;
  status: CommonStatus;
  cacheable: boolean;
}

const createDefaultForm = (): MenuFormModel => ({
  parentId: null,
  menuType: "directory",
  menuName: "",
  permissionCode: "",
  routePath: "",
  component: "",
  externalLink: "",
  icon: "",
  sort: 0,
  visible: true,
  status: "enabled",
  cacheable: false,
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IMenu | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const menuLoading = ref(false);
const menuTree = ref<IMenu[]>([]);
const formModel = ref<MenuFormModel>(createDefaultForm());

const rules = computed<FormRules>(() => ({
  menuName: [{ required: true, message: "请输入菜单名称", trigger: ["input", "blur"] }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: ["change"] }],
}));

const toTreeOptions = (menus: IMenu[], excludeId?: string): TreeSelectOption[] => {
  const root: TreeSelectOption = { key: "root", label: "根目录" };

  const mapNodes = (nodes: IMenu[]): TreeSelectOption[] =>
    nodes
      .filter((node) => node.id !== excludeId)
      .map((node) => ({
        key: node.id,
        label: node.menuName,
        children: node.children?.length ? mapNodes(node.children) : undefined,
      }));

  return [root, ...mapNodes(menus)];
};

const menuTreeOptions = computed<TreeSelectOption[]>(() =>
  toTreeOptions(menuTree.value, props.mode === "edit" ? props.record?.id : undefined),
);

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

const loadMenuDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const menu = await GetMenuById(props.record.id);
    formModel.value = {
      parentId: menu.parentId,
      menuType: menu.menuType,
      menuName: menu.menuName,
      permissionCode: menu.permissionCode ?? "",
      routePath: menu.routePath ?? "",
      component: menu.component ?? "",
      externalLink: menu.externalLink ?? "",
      icon: menu.icon ?? "",
      sort: menu.sort ?? 0,
      visible: menu.visible,
      status: menu.status,
      cacheable: menu.cacheable,
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      parentId: props.record.parentId,
      menuType: props.record.menuType,
      menuName: props.record.menuName,
      permissionCode: props.record.permissionCode ?? "",
      routePath: props.record.routePath ?? "",
      component: props.record.component ?? "",
      externalLink: props.record.externalLink ?? "",
      icon: props.record.icon ?? "",
      sort: props.record.sort ?? 0,
      visible: props.record.visible,
      status: props.record.status,
      cacheable: props.record.cacheable,
    };
    return;
  }

  formModel.value = createDefaultForm();
};

const buildPayload = (): ICreateMenuParams | IUpdateMenuParams => {
  const base: ICreateMenuParams = {
    parentId: formModel.value.parentId === "root" ? null : formModel.value.parentId,
    menuType: formModel.value.menuType,
    menuName: formModel.value.menuName.trim(),
    sort: formModel.value.sort,
    status: formModel.value.status,
  };

  if (formModel.value.menuType !== "button") {
    base.routePath = formModel.value.routePath.trim() || undefined;
    base.icon = formModel.value.icon.trim() || undefined;
    base.visible = formModel.value.visible;
  }

  if (formModel.value.menuType === "menu") {
    base.component = formModel.value.component.trim() || undefined;
    base.externalLink = formModel.value.externalLink.trim() || undefined;
    base.cacheable = formModel.value.cacheable;
  }

  if (formModel.value.menuType === "button") {
    base.permissionCode = formModel.value.permissionCode.trim() || undefined;
  }

  return base;
};

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
      await UpdateMenu(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateMenu(payload as ICreateMenuParams);
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

    await loadMenuTree();

    if (props.mode === "edit") {
      await loadMenuDetail();
    } else {
      resetFormFromRecord();
    }
  },
);
</script>

<style scoped></style>
