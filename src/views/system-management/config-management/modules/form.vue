<!-- 参数设置 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw"
    :title="mode === 'create' ? '新增参数' : '编辑参数'"
    :mask-closable="false"
    :show-icon="false"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="参数名称" path="paramName">
        <NInput
          v-model:value="formModel.paramName"
          placeholder="请输入参数名称"
          maxlength="50"
          show-count
          :disabled="isBuiltIn"
        />
      </NFormItem>
      <NFormItem label="参数键名" path="paramKey">
        <NInput
          v-model:value="formModel.paramKey"
          placeholder="请输入参数键名"
          maxlength="50"
          show-count
          :disabled="mode === 'edit' || isBuiltIn"
        />
      </NFormItem>
      <NFormItem label="参数键值" path="paramValue">
        <NInput
          v-model:value="formModel.paramValue"
          type="textarea"
          placeholder="请输入参数键值"
          maxlength="500"
          show-count
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </NFormItem>
      <NFormItem label="参数类型" path="paramType">
        <NRadioGroup v-model:value="formModel.paramType">
          <NSpace>
            <NRadio v-for="item in configTypeOptions" :key="item.value" :value="item.value">
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
import { CreateConfig, GetConfigById, UpdateConfig } from "@/api/system-management";
import type { ICreateConfigParams, IUpdateConfigParams } from "@/api/types";
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
import { computed, ref, watch } from "vue";
import { configTypeOptions, type IConfigRow } from "../data";

interface ConfigFormModel {
  paramName: string;
  paramKey: string;
  paramValue: string;
  paramType: "system" | "business";
  isEncrypted: boolean;
  remark: string;
}

const createDefaultForm = (): ConfigFormModel => ({
  paramName: "",
  paramKey: "",
  paramValue: "",
  paramType: "business",
  isEncrypted: false,
  remark: "",
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IConfigRow | null;
}>();

const emit = defineEmits<{ success: [] }>();
const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const formModel = ref<ConfigFormModel>(createDefaultForm());

const isBuiltIn = computed(() => props.mode === "edit" && props.record?.paramType === "system");

const rules: FormRules = {
  paramName: [{ required: true, message: "请输入参数名称", trigger: ["input", "blur"] }],
  paramKey: [{ required: true, message: "请输入参数键名", trigger: ["input", "blur"] }],
  paramValue: [{ required: true, message: "请输入参数键值", trigger: ["input", "blur"] }],
};

const loadDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const detail = await GetConfigById(props.record.id);
    formModel.value = {
      paramName: detail.paramName,
      paramKey: detail.paramKey,
      paramValue: detail.paramValue,
      paramType: detail.paramType,
      isEncrypted: detail.isEncrypted,
      remark: detail.remark ?? "",
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      paramName: props.record.paramName,
      paramKey: props.record.paramKey,
      paramValue: props.record.paramValue,
      paramType: props.record.paramType,
      isEncrypted: props.record.isEncrypted,
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

  const payload: ICreateConfigParams | IUpdateConfigParams = {
    paramName: formModel.value.paramName.trim(),
    paramKey: formModel.value.paramKey.trim(),
    paramValue: formModel.value.paramValue.trim(),
    paramType: formModel.value.paramType,
    isEncrypted: formModel.value.isEncrypted,
    remark: formModel.value.remark.trim() || undefined,
  };

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdateConfig(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateConfig(payload as ICreateConfigParams);
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
