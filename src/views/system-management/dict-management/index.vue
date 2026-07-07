<!-- 系统管理 -> 字典管理 -->

<template>
  <div class="size-full grid grid-cols-2 gap-4">
    <Page title="字典类型" @refresh="fetchDictTypes">
      <template #search>
        <SearchForm :model="typeQuery" :columns="1" @search="handleTypeSearch" @reset="handleTypeReset">
          <NFormItem label="字典名称" path="dictName">
            <NInput v-model:value="typeQuery.dictName" placeholder="请输入字典名称" clearable />
          </NFormItem>
          <NFormItem label="字典类型" path="dictType">
            <NInput v-model:value="typeQuery.dictType" placeholder="请输入字典类型" clearable />
          </NFormItem>
          <NFormItem label="状态" path="status">
            <NSelect
              v-model:value="typeQuery.status"
              :options="statusOptions"
              placeholder="请选择状态"
              clearable
              class="w-full"
            />
          </NFormItem>
        </SearchForm>
      </template>

      <template #toolbar>
        <Permission value="system:dict:add">
          <NButton type="primary" size="small" @click="handleCreateType">
            <template #icon>
              <NIcon :component="Add24Regular" />
            </template>
            新增
          </NButton>
        </Permission>
      </template>

      <template #default="maxHeight">
        <NDataTable
          :columns="typeColumns"
          :data="dictTypeList"
          :loading="typeLoading"
          :row-key="(row) => row.id"
          :row-props="typeRowProps"
          :max-height="maxHeight - 80"
          size="small"
          striped
          :row-class-name="typeRowClassName"
          scroll-x="fit-content"
        />
      </template>
    </Page>

    <Page title="字典数据" @refresh="fetchDictData">
      <template #search>
        <SearchForm :model="dataQuery" :columns="1" @search="handleDataSearch" @reset="handleDataReset">
          <NFormItem label="字典标签" path="dictLabel">
            <NInput
              v-model:value="dataQuery.dictLabel"
              placeholder="请输入字典标签"
              clearable
              :disabled="!selectedDictType"
            />
          </NFormItem>
          <NFormItem label="字典键值" path="dictValue">
            <NInput
              v-model:value="dataQuery.dictValue"
              placeholder="请输入字典键值"
              clearable
              :disabled="!selectedDictType"
            />
          </NFormItem>
          <NFormItem label="状态" path="status">
            <NSelect
              v-model:value="dataQuery.status"
              :options="statusOptions"
              placeholder="请选择状态"
              clearable
              class="w-full"
              :disabled="!selectedDictType"
            />
          </NFormItem>
        </SearchForm>
      </template>

      <template #toolbar>
        <Permission value="system:dict:add">
          <NButton type="primary" size="small" :disabled="!selectedDictType" @click="handleCreateData">
            <template #icon>
              <NIcon :component="Add24Regular" />
            </template>
            新增
          </NButton>
        </Permission>
      </template>

      <template #default="maxHeight">
        <NEmpty v-if="!selectedDictType" description="请先选择左侧字典类型" class="flex-1 justify-center" />
        <NDataTable
          v-else
          :columns="dataColumns"
          :data="dictDataList"
          :loading="dataLoading"
          :pagination="dataPagination"
          :row-key="(row) => row.id"
          remote
          :max-height="maxHeight - 80"
          size="small"
          striped
          scroll-x="fit-content"
        />
      </template>
    </Page>
  </div>

  <DictTypeForm v-model:show="typeFormVisible" :mode="typeFormMode" :record="editingType" @success="fetchDictTypes" />
  <DictDataForm
    v-model:show="dataFormVisible"
    :mode="dataFormMode"
    :record="editingData"
    :dict-type="selectedDictType?.dictType"
    @success="fetchDictData"
  />
</template>

<script setup lang="ts">
import {
  DeleteDictData,
  DeleteDictType,
  GetDictDataByType,
  GetDictDataList,
  GetDictTypeList,
} from "@/api/system-management";
import type { IQueryDictDataParams } from "@/api/types";
import { Page, Permission, SearchForm } from "@/components";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { NButton, NDataTable, NEmpty, NFormItem, NIcon, NInput, NSelect, useDialog, useMessage } from "naive-ui";
import { computed, onMounted, reactive, ref } from "vue";
import {
  createDictDataColumns,
  createDictTypeColumns,
  statusOptions,
  type IDictDataRow,
  type IDictTypeRow,
} from "./data";
import DictDataForm from "./modules/data-form.vue";
import DictTypeForm from "./modules/type-form.vue";

interface TypeQuery {
  dictName?: string;
  dictType?: string;
  status?: number | null;
}

interface DataQuery {
  dictLabel?: string;
  dictValue?: string;
  status?: number | null;
}

const message = useMessage();
const dialog = useDialog();

const typeLoading = ref(false);
const dataLoading = ref(false);
const dictTypeListRaw = ref<IDictTypeRow[]>([]);
const dictDataList = ref<IDictDataRow[]>([]);
const selectedDictType = ref<IDictTypeRow | null>(null);
const dataUseClientMode = ref(false);

const typeQuery = reactive<TypeQuery>({
  dictName: undefined,
  dictType: undefined,
  status: null,
});

const dataQuery = reactive<DataQuery>({
  dictLabel: undefined,
  dictValue: undefined,
  status: null,
});

const typeFormVisible = ref(false);
const typeFormMode = ref<"create" | "edit">("create");
const editingType = ref<IDictTypeRow | null>(null);

const dataFormVisible = ref(false);
const dataFormMode = ref<"create" | "edit">("create");
const editingData = ref<IDictDataRow | null>(null);

const dataPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    dataPagination.page = page;
    fetchDictData();
  },
  onUpdatePageSize: (pageSize: number) => {
    dataPagination.pageSize = pageSize;
    dataPagination.page = 1;
    fetchDictData();
  },
});

const matchesTypeQuery = (row: IDictTypeRow): boolean => {
  const dictName = typeQuery.dictName?.trim();
  const dictType = typeQuery.dictType?.trim();

  if (dictName && !row.dictName.includes(dictName)) return false;
  if (dictType && !row.dictType.includes(dictType)) return false;
  if (typeQuery.status !== undefined && typeQuery.status !== null && Number(row.status) !== typeQuery.status) {
    return false;
  }

  return true;
};

const dictTypeList = computed(() => dictTypeListRaw.value.filter(matchesTypeQuery));

const hasDataClientFilter = () => {
  const dictValue = dataQuery.dictValue?.trim();
  return Boolean(dictValue) || (dataQuery.status !== undefined && dataQuery.status !== null);
};

const filterDictDataRows = (rows: IDictDataRow[]): IDictDataRow[] => {
  const dictLabel = dataQuery.dictLabel?.trim();
  const dictValue = dataQuery.dictValue?.trim();

  return rows.filter((row) => {
    if (dictLabel && !row.dictLabel.includes(dictLabel)) return false;
    if (dictValue && !row.dictValue.includes(dictValue)) return false;
    if (dataQuery.status !== undefined && dataQuery.status !== null && Number(row.status) !== dataQuery.status) {
      return false;
    }
    return true;
  });
};

const buildDataQueryParams = (): IQueryDictDataParams => {
  const params: IQueryDictDataParams = {
    pageNum: dataPagination.page,
    pageSize: dataPagination.pageSize,
  };

  if (selectedDictType.value) {
    params.dictType = selectedDictType.value.dictType;
  }

  const dictLabel = dataQuery.dictLabel?.trim();
  if (dictLabel) params.dictLabel = dictLabel;

  return params;
};

const fetchDictTypes = async () => {
  try {
    typeLoading.value = true;
    dictTypeListRaw.value = await GetDictTypeList();

    if (selectedDictType.value) {
      const current = dictTypeListRaw.value.find((item) => item.id === selectedDictType.value?.id);
      selectedDictType.value = current ?? null;
    }
  } catch {
    dictTypeListRaw.value = [];
    selectedDictType.value = null;
  } finally {
    typeLoading.value = false;
  }
};

const fetchDictData = async () => {
  if (!selectedDictType.value) {
    dictDataList.value = [];
    dataPagination.itemCount = 0;
    return;
  }

  try {
    dataLoading.value = true;
    dataUseClientMode.value = hasDataClientFilter();

    if (dataUseClientMode.value) {
      const allRows = await GetDictDataByType(selectedDictType.value.dictType);
      const filteredRows = filterDictDataRows(allRows);
      dataPagination.itemCount = filteredRows.length;

      const start = (dataPagination.page - 1) * dataPagination.pageSize;
      dictDataList.value = filteredRows.slice(start, start + dataPagination.pageSize);
      return;
    }

    const { rows, total } = await GetDictDataList(buildDataQueryParams());
    dictDataList.value = rows;
    dataPagination.itemCount = total;
  } catch {
    dictDataList.value = [];
    dataPagination.itemCount = 0;
  } finally {
    dataLoading.value = false;
  }
};

const handleTypeSearch = () => {
  // 字典类型为客户端过滤，无需重新请求
};

const handleTypeReset = () => {
  typeQuery.dictName = undefined;
  typeQuery.dictType = undefined;
  typeQuery.status = null;
};

const handleDataSearch = () => {
  if (!selectedDictType.value) return;
  dataPagination.page = 1;
  fetchDictData();
};

const handleDataReset = () => {
  dataQuery.dictLabel = undefined;
  dataQuery.dictValue = undefined;
  dataQuery.status = null;
  dataPagination.page = 1;
  fetchDictData();
};

const handleSelectType = (row: IDictTypeRow) => {
  selectedDictType.value = row;
  dataPagination.page = 1;
  fetchDictData();
};

const typeRowProps = (row: IDictTypeRow) => ({
  style: "cursor: pointer",
  onClick: () => handleSelectType(row),
});

const typeRowClassName = (row: IDictTypeRow) =>
  selectedDictType.value?.id === row.id ? "dict-type-row--selected" : "";

const handleCreateType = () => {
  typeFormMode.value = "create";
  editingType.value = null;
  typeFormVisible.value = true;
};

const handleEditType = (row: IDictTypeRow) => {
  typeFormMode.value = "edit";
  editingType.value = row;
  typeFormVisible.value = true;
};

const handleDeleteType = (row: IDictTypeRow) => {
  dialog.warning({
    title: "确认删除",
    content: `确定要删除字典类型「${row.dictName}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteDictType(row.id);
        message.success("删除成功");
        if (selectedDictType.value?.id === row.id) {
          selectedDictType.value = null;
          dictDataList.value = [];
          dataPagination.itemCount = 0;
        }
        await fetchDictTypes();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

const handleCreateData = () => {
  dataFormMode.value = "create";
  editingData.value = null;
  dataFormVisible.value = true;
};

const handleEditData = (row: IDictDataRow) => {
  dataFormMode.value = "edit";
  editingData.value = row;
  dataFormVisible.value = true;
};

const handleDeleteData = (row: IDictDataRow) => {
  dialog.warning({
    title: "确认删除",
    content: `确定要删除字典数据「${row.dictLabel}」吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await DeleteDictData(row.id);
        message.success("删除成功");
        await fetchDictData();
      } catch {
        // 错误提示由响应拦截器处理
      }
    },
  });
};

const typeColumns = createDictTypeColumns({
  onEdit: handleEditType,
  onDelete: handleDeleteType,
});

const dataColumns = createDictDataColumns({
  onEdit: handleEditData,
  onDelete: handleDeleteData,
});

onMounted(() => {
  fetchDictTypes();
});
</script>

<style scoped>
:deep(.dict-type-row--selected td) {
  background-color: rgba(24, 160, 88, 0.08) !important;
}
</style>
