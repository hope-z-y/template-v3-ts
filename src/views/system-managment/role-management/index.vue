<!-- 系统管理 -> 角色管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="角色管理" @refresh="getRoleList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="角色名称" path="roleName">
          <NInput v-model:value="query.roleName" placeholder="请输入角色名称" clearable />
        </NFormItem>
        <NFormItem label="角色编码" path="roleCode">
          <NInput v-model:value="query.roleCode" placeholder="请输入角色编码" clearable />
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
        新增
      </NButton>
    </template>

    <template #default="maxHeight">
      <NDataTable
        :columns="columns"
        :bottom-bordered="false"
        :pagination="pagination"
        :data="tableData"
        :loading="loading"
        :row-key="(row) => row.id"
        scroll-x="fit-content"
        remote
        :max-height="maxHeight - 100"
        striped
        resizable
      />
    </template>
  </Page>

  <RoleForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getRoleList" />
</template>

<script setup lang="ts">
import { DeleteRole, GetRoleList } from "@/api/system-management";
import type { IQueryRoleParams } from "@/api/types";
import { Page, SearchForm, type PageColumnOption } from "@/components";
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
import { createRoleColumns, statusOptions, type IRoleRow } from "./data";
import RoleForm from "./modules/form.vue";
import type { Status } from "@/utils";

const message = useMessage();
const dialog = useDialog();

interface RoleQuery {
  roleName?: string;
  roleCode?: string;
  status?: number;
}

const createDefaultQuery = (): RoleQuery => ({
  roleName: undefined,
  roleCode: undefined,
  status: undefined,
});

const query = reactive<RoleQuery>(createDefaultQuery());

const loading = ref(false);
const tableData = ref<IRoleRow[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getRoleList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getRoleList();
  },
});

const buildQueryParams = (): IQueryRoleParams => {
  const params: IQueryRoleParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const roleName = query.roleName?.trim();
  const roleCode = query.roleCode?.trim();

  if (roleName) params.roleName = roleName;
  if (roleCode) params.roleCode = roleCode;
  if (query.status !== undefined && query.status !== null) params.status = query.status as Status;

  return params;
};

const getRoleList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetRoleList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getRoleList();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getRoleList();
};

const formVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRecord = ref<IRoleRow | null>(null);

const handleCreate = () => {
  formMode.value = "create";
  editingRecord.value = null;
  formVisible.value = true;
};

const handleEdit = (row: IRoleRow) => {
  formMode.value = "edit";
  editingRecord.value = row;
  formVisible.value = true;
};

const handleDelete = (row: IRoleRow) => {
  dialog.error({
    title: "确认删除",
    content: `确定要删除角色「${row.roleName}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteRole(row.id);
        message.success("删除成功");
        await getRoleList();
      } catch {
        // 错误提示由响应拦截器统一处理
      }
    },
  });
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "roleName", title: "角色名称", visible: true },
  { key: "roleCode", title: "角色编码", visible: true },
  { key: "roleSort", title: "显示顺序", visible: true },
  { key: "dataScope", title: "数据权限", visible: true },
  { key: "status", title: "状态", visible: true },
  { key: "createdAt", title: "创建时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IRoleRow>>(() => {
  const visibleKeys = new Set(
    columnOptions.value.filter((item) => item.visible).map((item) => item.key),
  );

  return [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createRoleColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key))),
  ];
});

onMounted(() => {
  getRoleList();
});
</script>

<style scoped></style>
