<!-- 系统管理 -> 用户管理 -->

<template>
  <UserPage />

  <!-- 新增 / 编辑用户表单，成功后刷新列表 -->
  <UserFormModal @success="pageApi.refresh" />
  <!-- 重置密码弹窗 -->
  <ResetPasswordModal />
</template>

<script setup lang="ts">
import { DeleteUser, GetDeptTree, GetUserList } from "@/api/system-management";
import type { IDept, IQueryUserParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import type { TreeSelectOption } from "naive-ui";
import { computed, onMounted, ref } from "vue";
import {
  BuildUserParams,
  CreateColumns,
  CreateSearchSchema,
  type IUserModalData,
  type IUserQuery,
  type IUserRow,
} from "./data";
import UserForm from "./modules/form.vue";
import ResetPassword from "./modules/reset-password.vue";

/* ------------------------------ 搜索区的部门树选项 ------------------------------ */

const searchOptionsLoading = ref(false);
const deptTree = ref<IDept[]>([]);

const toTreeOptions = (nodes: IDept[]): TreeSelectOption[] => {
  return nodes.map((node) => ({
    key: node.id,
    label: node.deptName,
    children: node.children?.length ? toTreeOptions(node.children) : undefined,
  }));
};

const deptTreeOptions = computed<TreeSelectOption[]>(() => toTreeOptions(deptTree.value));

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

onMounted(loadSearchOptions);

/* ---------------------------------- 弹窗 ---------------------------------- */

const [UserFormModal, formModalApi] = useModal<IUserModalData>({ connectedComponent: UserForm });
const [ResetPasswordModal, resetPasswordModalApi] = useModal<IUserRow>({ connectedComponent: ResetPassword });

/* ---------------------------------- 列表页 ---------------------------------- */

const [UserPage, pageApi] = usePage<IUserRow, IUserQuery, IQueryUserParams>({
  title: "用户管理",
  columnStorageKey: "template-v3-ts:columns:user-management",

  api: {
    list: GetUserList,
    delete: (row) => DeleteUser(row.id),
  },

  search: {
    defaults: () => ({
      account: undefined,
      username: undefined,
      phone: undefined,
      email: undefined,
      status: undefined,
      deptId: null,
    }),
    // 部门树 options 是异步加载的响应式数据，用 getter 注入让 schema 每次渲染取最新值
    schema: CreateSearchSchema({
      getDeptTreeOptions: () => deptTreeOptions.value,
      getDeptTreeLoading: () => searchOptionsLoading.value,
    }),
    buildParams: BuildUserParams,
  },

  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
    onResetPassword: (row) => resetPasswordModalApi.setData(row).open(),
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:user:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
    {
      label: "批量删除",
      icon: Delete24Regular,
      buttonType: "error",
      auth: "system:user:delete",
      // 勾选状态从回调上下文里拿（不要直接引用 pageApi，会造成类型循环推导）
      disabled: ({ checkedRowKeys }) => !checkedRowKeys.length,
      confirm: ({ checkedRowKeys }) => `确定要删除选中的 ${checkedRowKeys.length} 个用户吗？`,
      onConfirm: ({ checkedRowKeys }) => Promise.all(checkedRowKeys.map((id) => DeleteUser(String(id)))),
      successText: "批量删除成功",
    },
  ],
});
</script>

<style scoped></style>
