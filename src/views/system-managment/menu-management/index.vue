<!-- 系统管理 -> 菜单管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="菜单管理" @refresh="fetchTree">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="菜单名称" path="menuName">
          <NInput v-model:value="query.menuName" placeholder="请输入菜单名称" clearable />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="query.status"
            :options="statusOptions"
            placeholder="请选择状态"
            clearable
            class="w-full min-w-[160px]"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon :component="Add24Regular" />
        </template>
        新增菜单
      </NButton>
    </template>

    <template #default="maxHeight">
      <NDataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :scroll-x="1200"
        :row-key="(row) => row.id"
        children-key="children"
        default-expand-all
        :max-height="maxHeight - 20"
        striped
      />
    </template>
  </Page>

  <MenuForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="fetchTree" />
</template>

<script setup lang="ts">
import { DeleteMenu, GetMenuTree } from "@/api/system-management";
import type { IMenu } from "@/api/types";
import { Page, SearchForm, type PageColumnOption } from "@/components";
import { useMenuStore } from "@/stores";
import { normalizeMenuTree } from "@/utils";
import { Add24Regular } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NFormItem,
  NIcon,
  NInput,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createMenuColumns, statusOptions } from "./data";
import MenuForm from "./modules/form.vue";

interface MenuQuery {
  menuName?: string;
  status?: number;
}

const message = useMessage();
const dialog = useDialog();
const menuStore = useMenuStore();
const adminMenuTree = ref<IMenu[]>([]);
const loading = ref(false);

const query = reactive<MenuQuery>({
  menuName: undefined,
  status: undefined,
});

const formVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRecord = ref<IMenu | null>(null);

const matchesNode = (node: IMenu, filters: MenuQuery): boolean => {
  const menuName = filters.menuName?.trim();
  const nameMatched = !menuName || node.menuName.includes(menuName);
  const statusMatched =
    filters.status === undefined || filters.status === null || Number(node.status) === filters.status;
  return nameMatched && statusMatched;
};

const filterMenuTree = (nodes: IMenu[], filters: MenuQuery): IMenu[] => {
  return nodes.reduce<IMenu[]>((result, node) => {
    const children = node.children?.length ? filterMenuTree(node.children, filters) : [];

    if (matchesNode(node, filters) || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }

    return result;
  }, []);
};

const tableData = computed(() => filterMenuTree(adminMenuTree.value, query));

const handleCreate = () => {
  formMode.value = "create";
  editingRecord.value = null;
  formVisible.value = true;
};

const handleEdit = (row: IMenu) => {
  formMode.value = "edit";
  editingRecord.value = row;
  formVisible.value = true;
};

const handleDelete = (row: IMenu) => {
  dialog.warning({
    title: "确认删除",
    content: `确定要删除菜单「${row.menuName}」吗？若存在子菜单将一并删除。`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteMenu(row.id);
        message.success("删除成功");
        await fetchTree();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

const fetchTree = async () => {
  try {
    loading.value = true;
    const data = await GetMenuTree();
    adminMenuTree.value = normalizeMenuTree(data);
    await menuStore.initRoutes(true);
  } catch {
    adminMenuTree.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // 客户端过滤，无需重新请求
};

const handleReset = () => {
  query.menuName = undefined;
  query.status = undefined;
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "menuName", title: "菜单名称", visible: true },
  { key: "menuType", title: "类型", visible: true },
  { key: "sort", title: "排序", visible: true },
  { key: "permission", title: "权限标识", visible: true },
  { key: "path", title: "路由地址", visible: true },
  { key: "status", title: "状态", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IMenu>>(() => {
  const visibleKeys = new Set(
    columnOptions.value.filter((item) => item.visible).map((item) => item.key),
  );

  return createMenuColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key)));
});

onMounted(() => {
  fetchTree();
});
</script>

<style scoped>
:deep(.n-data-table-td) {
  vertical-align: middle;
}

:deep(.n-data-table-td .n-ellipsis) {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
</style>
