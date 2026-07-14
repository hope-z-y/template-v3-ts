<!-- 参数设置 -> 新增 / 编辑表单（useModal 内容方） -->

<template>
  <Modal>
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
            <NRadio v-for="item in ConfigTypeOptions" :key="item.value" :value="item.value">
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
  </Modal>
</template>

<script setup lang="ts">
import { CreateConfig, GetConfigById, UpdateConfig } from "@/api/system-management";
import type { ICreateConfigParams, IUpdateConfigParams } from "@/api/types";
import { useModal } from "@/hooks";
import {
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NSpace,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ConfigTypeOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IConfigModalData } from "../data";

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

const emit = defineEmits<{ success: [] }>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = ref<ConfigFormModel>(createDefaultForm());

const [Modal, modalApi] = useModal<IConfigModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑参数" : "新增参数"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

const mode = computed(() => modalApi.getData()?.mode ?? "create");

/** 内置参数只允许改键值和备注 */
const isBuiltIn = computed(() => {
  const data = modalApi.getData();
  return data?.mode === "edit" && data.record?.paramType === "system";
});

const rules: FormRules = {
  paramName: [{ required: true, message: "请输入参数名称", trigger: ["input", "blur"] }],
  paramKey: [{ required: true, message: "请输入参数键名", trigger: ["input", "blur"] }],
  paramValue: [{ required: true, message: "请输入参数键值", trigger: ["input", "blur"] }],
};

/** 弹窗打开：编辑模式拉详情回填（失败降级用行数据），新增模式用默认值 */
async function handleOpened(data: IConfigModalData) {
  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  const record = data.record;

  try {
    const detail = await GetConfigById(record.id);
    formModel.value = {
      paramName: detail.paramName,
      paramKey: detail.paramKey,
      paramValue: detail.paramValue,
      paramType: detail.paramType,
      isEncrypted: detail.isEncrypted,
      remark: detail.remark ?? "",
    };
  } catch {
    formModel.value = {
      paramName: record.paramName,
      paramKey: record.paramKey,
      paramValue: record.paramValue,
      paramType: record.paramType,
      isEncrypted: record.isEncrypted,
      remark: record.remark ?? "",
    };
  }
}

/** 点击"确定"：校验 -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
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

  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateConfig(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateConfig(payload as ICreateConfigParams);
      message.success("新增成功");
    }

    modalApi.close();
    emit("success");
  } catch {
    // 错误提示由响应拦截器统一处理
  } finally {
    modalApi.unlock();
  }
}
</script>

<style scoped></style>
