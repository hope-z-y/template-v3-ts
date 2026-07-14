<!-- 菜单管理 -> 新增 / 编辑表单（useModal 内容方） -->

<template>
  <Modal>
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
            <NRadioButton v-for="item in MenuTypeOptions" :key="item.value" :value="item.value">
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
              <NRadio v-for="item in CommonStatusOptions" :key="item.value" :value="item.value">
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
                <NRadio v-for="item in VisibleOptions" :key="String(item.value)" :value="item.value">
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
                <NRadio v-for="item in IsCacheOptions" :key="String(item.value)" :value="item.value">
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
  </Modal>
</template>

<script setup lang="ts">
import { CreateMenu, GetMenuById, GetMenuTree, UpdateMenu } from "@/api/system-management";
import type { CommonStatus, ICreateMenuParams, IMenu, IUpdateMenuParams, MenuType } from "@/api/types";
import { IconPicker } from "@/components";
import { useModal } from "@/hooks";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
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
import { CommonStatusOptions, IsCacheOptions, MenuTypeOptions, VisibleOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IMenuModalData } from "../data";

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

const emit = defineEmits<{
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const menuLoading = ref(false);
const menuTree = ref<IMenu[]>([]);
const formModel = ref<MenuFormModel>(createDefaultForm());

const [Modal, modalApi] = useModal<IMenuModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑菜单" : "新增菜单"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

const rules = computed<FormRules>(() => ({
  menuName: [{ required: true, message: "请输入菜单名称", trigger: ["input", "blur"] }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: ["change"] }],
}));

/** 上级菜单树选项：顶部固定"根目录"，编辑时排除自己 */
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

const menuTreeOptions = computed<TreeSelectOption[]>(() => {
  const data = modalApi.getData();
  return toTreeOptions(menuTree.value, data?.mode === "edit" ? data.record?.id : undefined);
});

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

/** 编辑模式回填（详情接口失败时的降级） */
const fillFormFromRecord = (data: IMenuModalData) => {
  if (data.mode === "edit" && data.record) {
    formModel.value = {
      parentId: data.record.parentId,
      menuType: data.record.menuType,
      menuName: data.record.menuName,
      permissionCode: data.record.permissionCode ?? "",
      routePath: data.record.routePath ?? "",
      component: data.record.component ?? "",
      externalLink: data.record.externalLink ?? "",
      icon: data.record.icon ?? "",
      sort: data.record.sort ?? 0,
      visible: data.record.visible,
      status: data.record.status,
      cacheable: data.record.cacheable,
    };
    return;
  }

  formModel.value = createDefaultForm();
};

/** 弹窗打开：加载菜单树，编辑模式再拉详情回填 */
async function handleOpened(data: IMenuModalData) {
  await loadMenuTree();

  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  try {
    const menu = await GetMenuById(data.record.id);
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
    fillFormFromRecord(data);
  }
}

/** 按菜单类型裁剪提交字段：目录不带组件配置、按钮只带权限标识 */
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

/** 点击"确定"：校验 -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload = buildPayload();
  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateMenu(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateMenu(payload as ICreateMenuParams);
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
