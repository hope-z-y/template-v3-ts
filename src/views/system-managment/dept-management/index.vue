<!-- 系统管理 -> 部门管理 -->

<template>
  <Page>
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
            class="w-full min-w-[160px]"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <template #title>部门管理</template>

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

    <div ref="pageRef" class="min-h-0 h-full overflow-hidden">
      <NDataTable
        class="h-full"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :scroll-x="1200"
        :flex-height="true"
        :row-key="(row) => row.id"
        children-key="children"
        default-expand-all
      />
    </div>

    <DeptForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="fetchTree" />
  </Page>
</template>

<script setup lang="ts">
import { DeleteDept, GetDeptTree } from "@/api/system-management";
import type { IDept } from "@/api/types";
import { Page, SearchForm } from "@/components";
import { useLoading } from "@/hooks";
import { Add24Regular } from "@vicons/fluent";
import { NButton, NDataTable, NFormItem, NIcon, NInput, NSelect, createDiscreteApi, useMessage } from "naive-ui";
import { computed, onMounted, reactive, ref, useTemplateRef } from "vue";
import { createDeptColumns, statusOptions } from "./data";
import DeptForm from "./modules/form.vue";

interface DeptQuery {
  deptName?: string;
  status?: number;
}

const message = useMessage();
const { dialog } = createDiscreteApi(["dialog"]);

const pageRef = useTemplateRef<HTMLDivElement>("pageRef");
const { start, stop } = useLoading(pageRef);

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
    start();

    deptTreeRaw.value = await GetDeptTree();
  } catch {
    deptTreeRaw.value = [];
  } finally {
    loading.value = false;
    stop();
  }
};

const handleReset = () => {
  query.deptName = undefined;
  query.status = undefined;
};

const columns = createDeptColumns({
  onEdit: handleEdit,
  onDelete: handleDelete,
});

onMounted(() => {
  fetchTree();
});
</script>

<style scoped></style>
