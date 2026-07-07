<!-- 参数设置 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 520px"
    :title="mode === 'create' ? '新增参数' : '编辑参数'"
    :mask-closable="false"
    :show-icon="false"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="参数名称" path="configName">
        <NInput
          v-model:value="formModel.configName"
          placeholder="请输入参数名称"
          maxlength="50"
          show-count
          :disabled="isBuiltIn"
        />
      </NFormItem>
      <NFormItem label="参数键名" path="configKey">
        <NInput
          v-model:value="formModel.configKey"
          placeholder="请输入参数键名"
          maxlength="50"
          show-count
          :disabled="mode === 'edit' || isBuiltIn"
        />
      </NFormItem>
      <NFormItem label="参数键值" path="configValue">
        <NInput
          v-model:value="formModel.configValue"
          type="textarea"
          placeholder="请输入参数键值"
          maxlength="500"
          show-count
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </NFormItem>
      <NFormItem v-if="mode === 'create'" label="系统内置" path="configType">
        <NRadioGroup v-model:value="formModel.configType">
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
  configName: string;
  configKey: string;
  configValue: string;
  configType: number;
  remark: string;
}

const createDefaultForm = (): ConfigFormModel => ({
  configName: "",
  configKey: "",
  configValue: "",
  configType: 0,
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

const isBuiltIn = computed(() => props.mode === "edit" && Number(props.record?.configType) === 1);

const rules: FormRules = {
  configName: [{ required: true, message: "请输入参数名称", trigger: ["input", "blur"] }],
  configKey: [{ required: true, message: "请输入参数键名", trigger: ["input", "blur"] }],
  configValue: [{ required: true, message: "请输入参数键值", trigger: ["input", "blur"] }],
};

const loadDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const detail = await GetConfigById(props.record.id);
    formModel.value = {
      configName: detail.configName,
      configKey: detail.configKey,
      configValue: detail.configValue,
      configType: detail.configType,
      remark: detail.remark ?? "",
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      configName: props.record.configName,
      configKey: props.record.configKey,
      configValue: props.record.configValue,
      configType: props.record.configType,
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
    configName: formModel.value.configName.trim(),
    configKey: formModel.value.configKey.trim(),
    configValue: formModel.value.configValue.trim(),
    configType: formModel.value.configType,
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
