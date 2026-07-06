<!-- 系统管理 -> 部门管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="部门管理" @refresh="fetchTree">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="fetchTree" @reset="handleReset">
        <NFormItem label="部门名称" path="deptName">
          <NInput v-model:value="query.deptName" placeholder="请输入部门名称" clearable />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="query.status"
            :options="statusOptions"
            placeholder="请选择状态"
            clearable
            class="w-full"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #toolbar>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon>
            <Add24Regular />
          </NIcon>
        </template>
        新增部门
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

  <DeptForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="fetchTree" />
</template>

<script setup lang="ts">
import { DeleteDept, GetDeptTree } from "@/api/system-management";
import type { IDept } from "@/api/types";
import { Page, SearchForm, type PageColumnOption } from "@/components";
import { Add24Regular } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NFormItem,
  NIcon,
  NInput,
  NSelect,
  createDiscreteApi,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createDeptColumns, statusOptions } from "./data";
import DeptForm from "./modules/form.vue";

interface DeptQuery {
  deptName?: string;
  status?: number;
}

const message = useMessage();
const { dialog } = createDiscreteApi(["dialog"]);

const loading = ref(false);
const deptTreeRaw = ref<IDept[]>([]);

const query = reactive<DeptQuery>({
  deptName: undefined,
  status: undefined,
});

const formVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRecord = ref<IDept | null>(null);

const matchesNode = (node: IDept, filters: DeptQuery): boolean => {
  const deptName = filters.deptName?.trim();
  const nameMatched = !deptName || node.deptName.includes(deptName);
  const statusMatched =
    filters.status === undefined || filters.status === null || Number(node.status) === filters.status;
  return nameMatched && statusMatched;
};

const filterDeptTree = (nodes: IDept[], filters: DeptQuery): IDept[] => {
  return nodes.reduce<IDept[]>((result, node) => {
    const children = node.children?.length ? filterDeptTree(node.children, filters) : [];

    if (matchesNode(node, filters) || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }

    return result;
  }, []);
};

const tableData = computed(() => filterDeptTree(deptTreeRaw.value, query));

const handleCreate = () => {
  formMode.value = "create";
  editingRecord.value = null;
  formVisible.value = true;
};

const handleEdit = (row: IDept) => {
  formMode.value = "edit";
  editingRecord.value = row;
  formVisible.value = true;
};

const handleDelete = (row: IDept) => {
  dialog.warning({
    title: "确认删除",
    content: `确定要删除部门「${row.deptName}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteDept(row.id);
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
    deptTreeRaw.value = await GetDeptTree();
  } catch {
    deptTreeRaw.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  query.deptName = undefined;
  query.status = undefined;
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "deptName", title: "部门名称", visible: true },
  { key: "sort", title: "显示顺序", visible: true },
  { key: "leader", title: "负责人", visible: true },
  { key: "phone", title: "联系电话", visible: true },
  { key: "email", title: "邮箱", visible: true },
  { key: "status", title: "状态", visible: true },
  { key: "createdAt", title: "创建时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IDept>>(() => {
  const visibleKeys = new Set(columnOptions.value.filter((item) => item.visible).map((item) => item.key));

  return createDeptColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key)));
});

onMounted(() => {
  fetchTree();
});
</script>

<style scoped></style>
