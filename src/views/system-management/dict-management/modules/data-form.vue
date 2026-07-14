<!-- 字典管理 -> 字典数据表单（useModal 内容方） -->

<template>
  <Modal>
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
            <NRadio v-for="item in IsDefaultOptions" :key="String(item.value)" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NSpace>
        </NRadioGroup>
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
import { CreateDictData, GetDictDataById, UpdateDictData } from "@/api/system-management";
import type { CommonStatus, ICreateDictDataParams, IUpdateDictDataParams } from "@/api/types";
import { useModal } from "@/hooks";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSpace,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { CommonStatusOptions, IsDefaultOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IDictDataModalData } from "../data";

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

const emit = defineEmits<{ success: [] }>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = ref<DataFormModel>(createDefaultForm());

const [Modal, modalApi] = useModal<IDictDataModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑字典数据" : "新增字典数据"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

/** 所属字典类型由列表页 setData 传入（只读展示） */
const dictType = computed(() => modalApi.getData()?.dictType ?? "");

const rules: FormRules = {
  dictLabel: [{ required: true, message: "请输入字典标签", trigger: ["input", "blur"] }],
  dictValue: [{ required: true, message: "请输入字典键值", trigger: ["input", "blur"] }],
};

/** 弹窗打开：编辑模式拉详情回填（失败降级用行数据），新增模式用默认值 */
async function handleOpened(data: IDictDataModalData) {
  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  const record = data.record;

  try {
    const detail = await GetDictDataById(record.id);
    formModel.value = {
      dictLabel: detail.dictLabel,
      dictValue: detail.dictValue,
      sort: detail.sort ?? 0,
      isDefault: detail.isDefault ?? false,
      status: detail.status,
      remark: detail.remark ?? "",
    };
  } catch {
    formModel.value = {
      dictLabel: record.dictLabel,
      dictValue: record.dictValue,
      sort: record.sort ?? 0,
      isDefault: record.isDefault ?? false,
      status: record.status,
      remark: record.remark ?? "",
    };
  }
}

/** 点击"确定"：校验 -> 提交 -> 关闭并通知列表刷新 */
async function handleSubmit() {
  const data = modalApi.getData();

  if (!data?.dictTypeId) {
    message.warning("请先选择字典类型");
    return;
  }

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const payload: ICreateDictDataParams | IUpdateDictDataParams = {
    dictTypeId: data.dictTypeId,
    dictLabel: formModel.value.dictLabel.trim(),
    dictValue: formModel.value.dictValue.trim(),
    sort: formModel.value.sort,
    isDefault: formModel.value.isDefault,
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
  };

  try {
    modalApi.lock();

    if (data.mode === "edit" && data.record) {
      await UpdateDictData(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreateDictData(payload as ICreateDictDataParams);
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
