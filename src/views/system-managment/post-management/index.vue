<!-- 系统管理 -> 岗位管理 -->

<template>
  <Page v-model:column-options="columnOptions" title="岗位管理" @refresh="getPostList">
    <template #search>
      <SearchForm :model="query" :columns="3" @search="handleSearch" @reset="handleReset">
        <NFormItem label="岗位名称" path="postName">
          <NInput v-model:value="query.postName" placeholder="请输入岗位名称" clearable />
        </NFormItem>
        <NFormItem label="岗位编码" path="postCode">
          <NInput v-model:value="query.postCode" placeholder="请输入岗位编码" clearable />
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

  <PostForm v-model:show="formVisible" :mode="formMode" :record="editingRecord" @success="getPostList" />
</template>

<script setup lang="ts">
import { DeletePost, GetPostList } from "@/api/system-management";
import type { IQueryPostParams } from "@/api/types";
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
import { createPostColumns, statusOptions, type IPostRow } from "./data";
import PostForm from "./modules/form.vue";
import type { Status } from "@/utils";

const message = useMessage();
const dialog = useDialog();

interface PostQuery {
  postName?: string;
  postCode?: string;
  status?: number;
}

const createDefaultQuery = (): PostQuery => ({
  postName: undefined,
  postCode: undefined,
  status: undefined,
});

const query = reactive<PostQuery>(createDefaultQuery());
const loading = ref(false);
const tableData = ref<IPostRow[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    getPostList();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getPostList();
  },
});

const buildQueryParams = (): IQueryPostParams => {
  const params: IQueryPostParams = {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
  };

  const postName = query.postName?.trim();
  const postCode = query.postCode?.trim();

  if (postName) params.postName = postName;
  if (postCode) params.postCode = postCode;
  if (query.status !== undefined && query.status !== null) params.status = query.status as Status;

  return params;
};

const getPostList = async () => {
  try {
    loading.value = true;
    const { rows, total } = await GetPostList(buildQueryParams());
    tableData.value = rows;
    pagination.itemCount = total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getPostList();
};

const handleReset = () => {
  Object.assign(query, createDefaultQuery());
  pagination.page = 1;
  getPostList();
};

const formVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRecord = ref<IPostRow | null>(null);

const handleCreate = () => {
  formMode.value = "create";
  editingRecord.value = null;
  formVisible.value = true;
};

const handleEdit = (row: IPostRow) => {
  formMode.value = "edit";
  editingRecord.value = row;
  formVisible.value = true;
};

const handleDelete = (row: IPostRow) => {
  dialog.error({
    title: "确认删除",
    content: `确定要删除岗位「${row.postName}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeletePost(row.id);
        message.success("删除成功");
        await getPostList();
      } catch {
        // 错误提示由响应拦截器统一处理
      }
    },
  });
};

const columnOptions = ref<PageColumnOption[]>([
  { key: "postCode", title: "岗位编码", visible: true },
  { key: "postName", title: "岗位名称", visible: true },
  { key: "postSort", title: "显示顺序", visible: true },
  { key: "status", title: "状态", visible: true },
  { key: "createdAt", title: "创建时间", visible: true },
  { key: "actions", title: "操作", visible: true, disabled: true },
]);

const columns = computed<DataTableColumns<IPostRow>>(() => {
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
    ...createPostColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }).filter((column) => "key" in column && column.key && visibleKeys.has(String(column.key))),
  ];
});

onMounted(() => {
  getPostList();
});
</script>

<style scoped></style>
