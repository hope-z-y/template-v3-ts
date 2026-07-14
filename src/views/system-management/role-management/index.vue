<!-- 系统管理 -> 角色管理 -->

<template>
  <RolePage />

  <RoleFormModal @success="pageApi.refresh" />
</template>

<script setup lang="ts">
import { DeleteRole, GetRoleList } from "@/api/system-management";
import type { IQueryRoleParams } from "@/api/types";
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { CreateColumns, SearchSchema, type IRoleModalData, type IRoleQuery, type IRoleRow } from "./data";
import RoleForm from "./modules/form.vue";

const [RoleFormModal, formModalApi] = useModal<IRoleModalData>({ connectedComponent: RoleForm });

const [RolePage, pageApi] = usePage<IRoleRow, IRoleQuery, IQueryRoleParams>({
  title: "角色管理",
  columnStorageKey: "system:role:columns",

  api: {
    list: GetRoleList,
    delete: (row) => DeleteRole(row.id),
  },

  search: {
    defaults: () => ({ roleName: undefined, roleKey: undefined, status: undefined }),
    schema: SearchSchema,
  },

  columns: CreateColumns({
    onEdit: (row) => formModalApi.setData({ mode: "edit", record: row }).open(),
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:role:create",
      onClick: () => formModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],
});
</script>

<style scoped></style>
