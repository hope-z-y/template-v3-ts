<!-- 字典管理 -> 字典类型表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 480px"
    :title="mode === 'create' ? '新增字典类型' : '编辑字典类型'"
    :mask-closable="false"
    :show-icon="false"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="字典名称" path="dictName">
        <NInput v-model:value="formModel.dictName" placeholder="请输入字典名称" maxlength="50" show-count />
      </NFormItem>
      <NFormItem label="字典类型" path="dictType">
        <NInput
          v-model:value="formModel.dictType"
          placeholder="请输入字典类型"
          maxlength="50"
          show-count
          :disabled="mode === 'edit'"
        />
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
import { CreateDictType, GetDictTypeById, UpdateDictType } from "@/api/system-management";
import type { ICreateDictTypeParams, IUpdateDictTypeParams } from "@/api/types";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NRadio,
  NRadioGroup,
  NSpace,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ref, watch } from "vue";
import { statusOptions, type IDictTypeRow } from "../data";

interface TypeFormModel {
  dictName: string;
  dictType: string;
  status: number;
  remark: string;
}

const createDefaultForm = (): TypeFormModel => ({
  dictName: "",
  dictType: "",
  status: 1,
  remark: "",
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IDictTypeRow | null;
}>();

const emit = defineEmits<{ success: [] }>();
const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const formModel = ref<TypeFormModel>(createDefaultForm());

const rules: FormRules = {
  dictName: [{ required: true, message: "请输入字典名称", trigger: ["input", "blur"] }],
  dictType: [{ required: true, message: "请输入字典类型", trigger: ["input", "blur"] }],
};

const loadDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const detail = await GetDictTypeById(props.record.id);
    formModel.value = {
      dictName: detail.dictName,
      dictType: detail.dictType,
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
      dictName: props.record.dictName,
      dictType: props.record.dictType,
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
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload: ICreateDictTypeParams | IUpdateDictTypeParams = {
    dictName: formModel.value.dictName.trim(),
    dictType: formModel.value.dictType.trim(),
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
  };

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateDictType(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDictType(payload as ICreateDictTypeParams);
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
