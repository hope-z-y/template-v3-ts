<!-- 字典管理 -> 字典数据表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw"
    :title="mode === 'create' ? '新增字典数据' : '编辑字典数据'"
    :mask-closable="false"
    :show-icon="false"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="字典类型">
        <NInput :value="dictType" disabled />
      </NFormItem>
      <NFormItem label="字典标签" path="dictLabel">
        <NInput v-model:value="formModel.dictLabel" placeholder="请输入字典标签" maxlength="50" show-count />
      </NFormItem>
      <NFormItem label="字典键值" path="dictValue">
        <NInput v-model:value="formModel.dictValue" placeholder="请输入字典键值" maxlength="50" show-count />
      </NFormItem>
      <NFormItem label="显示顺序" path="sort">
        <NInputNumber v-model:value="formModel.sort" class="w-full" placeholder="请输入显示顺序" :min="0" />
      </NFormItem>
      <NFormItem label="是否默认" path="isDefault">
        <NRadioGroup v-model:value="formModel.isDefault">
          <NSpace>
            <NRadio v-for="item in isDefaultOptions" :key="String(item.value)" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>
      <NFormItem label="状态" path="status">
        <NRadioGroup v-model:value="formModel.status">
          <NSpace>
            <NRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>
      <NFormItem label="备注" path="remark">
        <NInput
          v-model:value="formModel.remark"
          type="textarea"
          placeholder="请输入备注"
          maxlength="500"
          show-count
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </NFormItem>
    </NForm>

    <template #action>
      <div class="flex justify-end gap-2">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">确定</NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { CreateDictData, GetDictDataById, UpdateDictData } from "@/api/system-management";
import type { CommonStatus, ICreateDictDataParams, IUpdateDictDataParams } from "@/api/types";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSpace,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ref, watch } from "vue";
import { isDefaultOptions, statusOptions, type IDictDataRow } from "../data";

interface DataFormModel {
  dictLabel: string;
  dictValue: string;
  sort: number;
  isDefault: boolean;
  status: CommonStatus;
  remark: string;
}

const createDefaultForm = (): DataFormModel => ({
  dictLabel: "",
  dictValue: "",
  sort: 0,
  isDefault: false,
  status: "enabled",
  remark: "",
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IDictDataRow | null;
  dictType?: string;
  dictTypeId?: string;
}>();

const emit = defineEmits<{ success: [] }>();
const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const formModel = ref<DataFormModel>(createDefaultForm());

const rules: FormRules = {
  dictLabel: [{ required: true, message: "请输入字典标签", trigger: ["input", "blur"] }],
  dictValue: [{ required: true, message: "请输入字典键值", trigger: ["input", "blur"] }],
};

const loadDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const detail = await GetDictDataById(props.record.id);
    formModel.value = {
      dictLabel: detail.dictLabel,
      dictValue: detail.dictValue,
      sort: detail.sort ?? 0,
      isDefault: detail.isDefault ?? false,
      status: detail.status,
      remark: detail.remark ?? "",
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      dictLabel: props.record.dictLabel,
      dictValue: props.record.dictValue,
      sort: props.record.sort ?? 0,
      isDefault: props.record.isDefault ?? false,
      status: props.record.status,
      remark: props.record.remark ?? "",
    };
    return;
  }

  formModel.value = createDefaultForm();
};

const handleAfterLeave = () => {
  formRef.value?.restoreValidation();
  formModel.value = createDefaultForm();
};

const handleSubmit = async () => {
  if (!props.dictTypeId) {
    message.warning("请先选择字典类型");
    return;
  }

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload: ICreateDictDataParams | IUpdateDictDataParams = {
    dictTypeId: props.dictTypeId,
    dictLabel: formModel.value.dictLabel.trim(),
    dictValue: formModel.value.dictValue.trim(),
    sort: formModel.value.sort,
    isDefault: formModel.value.isDefault,
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
  };

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateDictData(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDictData(payload as ICreateDictDataParams);
      message.success("新增成功");
    }

    visible.value = false;
    emit("success");
  } catch {
    // 错误提示由响应拦截器统一处理
  } finally {
    submitting.value = false;
  }
};

watch(
  () => visible.value,
  async (show) => {
    if (!show) return;

    if (props.mode === "edit") {
      await loadDetail();
    } else {
      resetFormFromRecord();
    }
  },
);
</script>
