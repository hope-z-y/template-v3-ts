<!-- 字典管理 -> 字典类型表单（useModal 内容方） -->

<template>
  <Modal>
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
            <NRadio v-for="item in CommonStatusOptions" :key="item.value" :value="item.value">
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
import { CreateDictType, GetDictTypeById, UpdateDictType } from "@/api/system-management";
import type { CommonStatus, ICreateDictTypeParams, IUpdateDictTypeParams } from "@/api/types";
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
import { CommonStatusOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IDictTypeModalData } from "../data";

interface TypeFormModel {
  dictName: string;
  dictType: string;
  status: CommonStatus;
  remark: string;
}

const createDefaultForm = (): TypeFormModel => ({
  dictName: "",
  dictType: "",
  status: "enabled",
  remark: "",
});

const emit = defineEmits<{ success: [] }>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = ref<TypeFormModel>(createDefaultForm());

const [Modal, modalApi] = useModal<IDictTypeModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑字典类型" : "新增字典类型"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

const mode = computed(() => modalApi.getData()?.mode ?? "create");

const rules: FormRules = {
  dictName: [{ required: true, message: "请输入字典名称", trigger: ["input", "blur"] }],
  dictType: [{ required: true, message: "请输入字典类型", trigger: ["input", "blur"] }],
};

/** 弹窗打开：编辑模式拉详情回填（失败降级用行数据），新增模式用默认值 */
async function handleOpened(data: IDictTypeModalData) {
  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  const record = data.record;

  try {
    const detail = await GetDictTypeById(record.id);
    formModel.value = {
      dictName: detail.dictName,
      dictType: detail.dictType,
      status: detail.status,
      remark: detail.remark ?? "",
    };
  } catch {
    formModel.value = {
      dictName: record.dictName,
      dictType: record.dictType,
      status: record.status,
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

  const payload: ICreateDictTypeParams | IUpdateDictTypeParams = {
    dictName: formModel.value.dictName.trim(),
    dictType: formModel.value.dictType.trim(),
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
  };

  const data = modalApi.getData();

  try {
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdateDictType(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDictType(payload as ICreateDictTypeParams);
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
