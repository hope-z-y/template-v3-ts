<!--
  系统管理 -> 用户管理（主页面）

  职责：
  1. 展示用户列表（分页、多选）
  2. 提供新增 / 编辑 / 删除 / 批量删除 / 重置密码等操作入口
  3. 挂载子组件：UserForm（新增/编辑）、ResetPassword（重置密码）
-->

<template>
  <!-- #region 页面布局 -->
  <Page v-model:column-options="columnOptions" title="用户管理" @refresh="getUserList">
    <!-- 搜索区域：条件较多，默认展示 3 列，超出部分可展开 -->
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="登录账号" path="account">
          <NInput v-model:value="query.account" placeholder="请输入登录账号" clearable />
        </NFormItem>
        <NFormItem label="用户名称" path="username">
          <NInput v-model:value="query.username" placeholder="请输入用户名称" clearable />
        </NFormItem>
        <NFormItem label="手机号" path="phone">
          <NInput v-model:value="query.phone" placeholder="请输入手机号" clearable />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="query.email" placeholder="请输入邮箱" clearable />
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
        <NFormItem label="所属部门" path="deptId">
          <NTreeSelect
            v-model:value="query.deptId"
            :options="deptTreeOptions"
            :loading="searchOptionsLoading"
            placeholder="请选择所属部门"
            clearable
            default-expand-all
            key-field="key"
            label-field="label"
            children-field="children"
            class="w-full"
          />
        </NFormItem>
      </SearchForm>
    </template>

    <!-- 工具栏：新增、批量删除、导入、导出 -->
    <template #toolbar>
      <Permission value="system:user:create">
        <NButton type="primary" @click="handleCreate">
          <template #icon>
            <NIcon :component="Add24Regular" />
          </template>
          新增
        </NButton>
      </Permission>
      <Permission value="system:user:delete">
        <NButton type="error" :disabled="!checkedRowKeys.length" @click="handleMultiDelete">
          <template #icon>
            <NIcon :component="Delete24Regular" />
          </template>
          批量删除
        </NButton>
      </Permission>
    </template>

    <!-- 用户数据表格：remote 表示分页由服务端处理 -->
    <template #default="maxHeight">
      <NDataTable
        :columns="columns"
        :bottom-bordered="false"
        :pagination="pagination"
        :data="tableData"
        :loading="loading"
        :row-key="(row) => row.id"
        :checked-row-keys="checkedRowKeys"
        scroll-x="fit-content"
        remote
        :max-height="maxHeight - 100"
        striped
        resizable
        @update:checked-row-keys="handleCheckedRowKeysChange"
      />
    </template>
  </Page>
  <!-- #endregion -->

  <!-- #region 子弹窗组件 -->
  <!-- 新增 / 编辑用户表单，成功后刷新列表 -->
  <UserForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getUserList" />
  <!-- 重置密码弹窗 -->
  <ResetPassword v-model:show="resetPasswordVisible" :user="resetPasswordUser" />
  <!-- #endregion -->
</template>

<script setup lang="ts">
// #region 依赖引入
import { DeleteUser, GetDeptTree, GetUserList } from "@/api/system-management";
import type { IDept, IQueryUserParams } from "@/api/types";
import { Page, Permission, SearchForm, type PageColumnOption } from "@/components";
import { useColumnVisibility, useCrudDialog } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import {
  NButton,
  NDataTable,
  NFormItem,
  NIcon,
  NInput,
  NSelect,
  NTreeSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
  type TreeSelectOption,
} from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import { createUserColumns, statusOptions, type IUserRow } from "./data";
import ResetPassword from "./modules/reset-password.vue";
import UserForm from "./modules/form.vue";
// #endregion

// #region 全局反馈工具
// useMessage：顶部消息提示；useDialog：确认弹窗
const message = useMessage();
const dialog = useDialog();
// #endregion

// #region 搜索条件
interface UserQuery {
  account?: string;
  username?: string;
  phone?: string;
  email?: string;
  status?: IQueryUserParams["status"];
  deptId?: string | null;
}

const createDefaultQuery = (): UserQuery => ({
  account: undefined,
  username: undefined,
  phone: undefined,
  email: undefined,
  status: undefined,
  deptId: null,
});

const query = reactive<UserQuery>(createDefaultQuery());

const searchOptionsLoading = ref(false);
const deptTree = ref<IDept[]>([]);

/** 部门树 -> NTreeSelect 选项 */
const toTreeOptions = (nodes: IDept[]): TreeSelectOption[] => {
  return nodes.map((node) => ({
    key: node.id,
    label: node.deptName,
    children: node.children?.length ? toTreeOptions(node.children) : undefined,
  }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => toTreeOptions(deptTree.value));

/** 加载搜索区下拉数据（部门树） */
const loadSearchOptions = async () => {
  try {
    searchOptionsLoading.value = true;
    deptTree.value = await GetDeptTree();
  } catch {
    deptTree.value = [];
  } finally {
    searchOptionsLoading.value = false;
  }
};

/** 将表单条件与分页参数合并为接口查询参数（空值不传） */
const buildQueryParams = (): IQueryUserParams => {
  const params: IQueryUserParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const account = query.account?.trim();
  const username = query.username?.trim();
  const phone = query.phone?.trim();
  const email = query.email?.trim();

  if (account) params.account = account;
  if (username) params.username = username;
  if (phone) params.phone = phone;
  if (email) params.email = email;
  if (query.status) params.status = query.status;
  if (query.deptId) params.deptId = [query.deptId];

  return params;
};

/** 搜索：回到第一页并重新请求 */
const handleSearch = () => {
  pagination.page = 1;
  getUserList();
};

/** 重置：清空条件并重新请求 */
const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getUserList();
};
// #endregion

// #region 获取用户列表
// loading：表格加载状态；tableData：当前页数据；checkedRowKeys：已勾选行的 id
const loading = ref<boolean>(false);
const tableData = ref<IUserRow[]>([]);
const checkedRowKeys = ref<Array<string | number>>([]);

// pagination：分页配置，页码 / 每页条数变化时重新请求列表
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getUserList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getUserList();
  },
});

/** 请求用户列表并更新表格与分页总数 */
const getUserList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetUserList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
    checkedRowKeys.value = []; // 刷新后清空勾选，避免 id 与当前页不一致
  } finally {
    loading.value = false;
  }
};

// 页面挂载后立即拉取第一页数据，并加载搜索区下拉选项
onMounted(() => {
  loadSearchOptions();
  getUserList();
});
// #endregion

// #region 新增 / 编辑表单弹窗
const {
  visible: formVisible,
  mode: formMode,
  record: editingRecord,
  openCreate: handleCreate,
  openEdit: handleEdit,
} = useCrudDialog<IUserRow>();
// #endregion

// #region 重置密码弹窗
const resetPasswordVisible = ref(false);
const resetPasswordUser = ref<IUserRow | null>(null);

/** 打开重置密码弹窗 */
const handleResetPassword = (row: IUserRow) => {
  resetPasswordUser.value = row;
  resetPasswordVisible.value = true;
};
// #endregion

// #region 删除用户
/** 单条删除：二次确认后调用接口 */
const handleDelete = (row: IUserRow) => {
  dialog.error({
    title: "确认删除",
    content: `确定要删除用户「${row.username || row.account}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteUser(row.id);
        message.success("删除成功");
        await getUserList();
      } catch {
        // 错误提示由响应拦截器统一处理
      }
    },
  });
};

/** 批量删除：根据 checkedRowKeys 并发删除 */
const handleMultiDelete = () => {
  if (!checkedRowKeys.value.length) return;

  dialog.error({
    title: "确认批量删除",
    content: `确定要删除选中的 ${checkedRowKeys.value.length} 个用户吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await Promise.all(checkedRowKeys.value.map((id) => DeleteUser(String(id))));
        message.success("批量删除成功");
        await getUserList();
      } catch {
        // 错误提示由响应拦截器统一处理
      }
    },
  });
};
// #endregion

// #region 表格列配置
const defaultColumnOptions: PageColumnOption[] = [
  { key: "username", title: "用户名", visible: true },
  { key: "account", title: "账号", visible: true },
  { key: "phone", title: "手机号", visible: true },
  { key: "email", title: "邮箱", visible: true },
  { key: "gender", title: "性别", visible: true },
  { key: "deptId", title: "所属部门", visible: true },
  { key: "status", title: "状态", visible: true },
  { key: "createdAt", title: "创建时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
];

const { columnOptions, visibleKeys } = useColumnVisibility(
  defaultColumnOptions,
  "template-v3-ts:columns:user-management",
);

// 合并「多选列」与 data.ts 中定义的业务列，并注入行内操作回调
const columns = computed<DataTableColumns<IUserRow>>(() => {
  return [
    { type: "selection" },
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      titleAlign: "center",
      render: (_row, rowIndex) => (pagination.page - 1) * pagination.pageSize + rowIndex + 1,
    },
    ...createUserColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      onResetPassword: handleResetPassword,
    }).filter((column) => "key" in column && column.key && visibleKeys.value.has(String(column.key))),
  ];
});
// #endregion

// #region 表格多选
/** 同步 Naive UI 表格勾选状态到 checkedRowKeys */
const handleCheckedRowKeysChange = (keys: Array<string | number>) => {
  checkedRowKeys.value = keys;
};
// #endregion
</script>

<style scoped></style>
