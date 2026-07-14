<!-- 系统管理 -> 字典管理（主从双表：左侧字典类型，右侧联动字典数据） -->

<template>
  <div class="size-full grid grid-cols-2 gap-4">
    <!-- 同一页面调用两次 usePage，两套状态完全独立 -->
    <TypePage />
    <DataPage />
  </div>

  <TypeFormModal @success="typePageApi.refresh" />
  <DataFormModal @success="dataPageApi.refresh" />
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
import { useModal, usePage } from "@/hooks";
import Add24Regular from "@vicons/fluent/es/Add24Regular";
import { ref } from "vue";
import {
  BuildDictDataParams,
  CreateDataColumns,
  CreateDataSearchSchema,
  CreateTypeColumns,
  FilterDictDataRows,
  FilterTypeRows,
  TypeSearchSchema,
  type IDictDataListParams,
  type IDictDataModalData,
  type IDictDataQuery,
  type IDictDataRow,
  type IDictTypeModalData,
  type IDictTypeQuery,
  type IDictTypeRow,
} from "./data";
import DictDataForm from "./modules/data-form.vue";
import DictTypeForm from "./modules/type-form.vue";

/** 主从联动的关键状态：当前选中的字典类型（左表行点击设置，右表取数依赖它） */
const selectedDictType = ref<IDictTypeRow | null>(null);

const [TypeFormModal, typeFormModalApi] = useModal<IDictTypeModalData>({ connectedComponent: DictTypeForm });
const [DataFormModal, dataFormModalApi] = useModal<IDictDataModalData>({ connectedComponent: DictDataForm });

/* -------------------------------- 左表：字典类型 -------------------------------- */

const [TypePage, typePageApi] = usePage<IDictTypeRow, IDictTypeQuery>({
  title: "字典类型",

  api: {
    // 类型数量有限，一次拉全量走客户端过滤
    list: async () => (await GetDictTypeList({ pageNum: 1, pageSize: 200 })).rows,
  },

  pagination: false,
  heightOffset: 80,

  search: {
    defaults: () => ({ dictName: undefined, dictType: undefined, status: null }),
    schema: TypeSearchSchema,
    clientFilter: FilterTypeRows,
  },

  hooks: {
    // 类型列表刷新后重新对齐选中项：被删除的类型要取消选中并清空右表
    afterFetch: (rows) => {
      if (!selectedDictType.value) return;

      const current = rows.find((item) => item.id === selectedDictType.value?.id);
      selectedDictType.value = current ?? null;

      if (!current) {
        dataPageApi.search();
      }
    },
  },

  columns: CreateTypeColumns({
    onEdit: (row) => typeFormModalApi.setData({ mode: "edit", record: row }).open(),
    // 自定义删除逻辑：删除的是当前选中类型时，同步清空右表
    onDelete: async (row) => {
      await DeleteDictType(row.id);

      if (selectedDictType.value?.id === row.id) {
        selectedDictType.value = null;
        await dataPageApi.search();
      }
    },
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:dict-type:create",
      onClick: () => typeFormModalApi.setData({ mode: "create", record: null }).open(),
    },
  ],

  table: {
    size: "small",
    resizable: false,
    // 行点击选中类型，右表回到第一页重新取数
    rowProps: (row: IDictTypeRow) => ({
      style: "cursor: pointer",
      onClick: () => {
        selectedDictType.value = row;
        dataPageApi.search();
      },
    }),
    rowClassName: (row: IDictTypeRow) => (selectedDictType.value?.id === row.id ? "dict-type-row--selected" : ""),
  },
});

/* -------------------------------- 右表：字典数据 -------------------------------- */

/**
 * 混合取数策略（与原实现一致）：
 * - 只按标签搜索（或无条件）：走服务端分页接口
 * - 按键值 / 状态搜索：服务端接口不支持，改拉该类型全量数据后在前端过滤 + 手动分页
 */
const fetchDictData = async (params: IDictDataListParams) => {
  const selected = selectedDictType.value;

  // 未选中类型时右表恒为空（配合 emptyDescription 提示）
  if (!selected) return { rows: [], total: 0 };

  const useClientMode = Boolean(params.dictValue) || (params.status !== undefined && params.status !== null);

  if (useClientMode) {
    const allRows = await GetDictDataByType(selected.dictType);
    const filteredRows = FilterDictDataRows(allRows, params);
    const start = (params.pageNum - 1) * params.pageSize;

    return {
      rows: filteredRows.slice(start, start + params.pageSize),
      total: filteredRows.length,
    };
  }

  const query: IQueryDictDataParams = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    dictTypeId: selected.id,
  };
  if (params.dictLabel) query.dictLabel = params.dictLabel;

  return GetDictDataList(query);
};

const [DataPage, dataPageApi] = usePage<IDictDataRow, IDictDataQuery, IDictDataListParams>({
  title: "字典数据",

  api: {
    list: fetchDictData,
    delete: (row) => DeleteDictData(row.id),
  },

  pagination: { pageSizes: [10, 20, 50] },
  heightOffset: 80,
  emptyDescription: () => (selectedDictType.value ? "暂无数据" : "请先选择左侧字典类型"),

  search: {
    defaults: () => ({ dictLabel: undefined, dictValue: undefined, status: null }),
    schema: CreateDataSearchSchema({ isTypeSelected: () => Boolean(selectedDictType.value) }),
    buildParams: BuildDictDataParams,
  },

  columns: CreateDataColumns({
    onEdit: (row) =>
      dataFormModalApi
        .setData({
          mode: "edit",
          record: row,
          dictType: selectedDictType.value?.dictType,
          dictTypeId: selectedDictType.value?.id,
        })
        .open(),
  }),

  toolbar: [
    {
      label: "新增",
      icon: Add24Regular,
      auth: "system:dict-data:create",
      disabled: () => !selectedDictType.value,
      onClick: () =>
        dataFormModalApi
          .setData({
            mode: "create",
            record: null,
            dictType: selectedDictType.value?.dictType,
            dictTypeId: selectedDictType.value?.id,
          })
          .open(),
    },
  ],

  table: {
    size: "small",
    resizable: false,
  },
});
</script>

<style scoped>
:deep(.dict-type-row--selected td) {
  background-color: rgba(24, 160, 88, 0.08) !important;
}
</style>
