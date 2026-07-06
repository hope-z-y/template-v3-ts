<!-- 岗位管理 -> 新增 / 编辑表单 -->

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    style="width: 40vw; min-width: 560px"
    :title="mode === 'create' ? '新增岗位' : '编辑岗位'"
    :mask-closable="false"
    :show-icon="false"
    content-class="my-4!"
    title-class="naive-modal-title"
    @after-leave="handleAfterLeave"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="岗位编码" path="postCode">
        <NInput
          v-model:value="formModel.postCode"
          placeholder="请输入岗位编码"
          maxlength="50"
          show-count
          :disabled="mode === 'edit'"
        />
      </NFormItem>
      <NFormItem label="岗位名称" path="postName">
        <NInput v-model:value="formModel.postName" placeholder="请输入岗位名称" maxlength="50" show-count />
      </NFormItem>
      <NFormItem label="显示顺序" path="postSort">
        <NInputNumber v-model:value="formModel.postSort" class="w-full" placeholder="请输入显示顺序" :min="0" />
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
        <NButton @click="handleCancel">
          <template #icon>
            <NIcon><Dismiss24Regular /></NIcon>
          </template>
          取消
        </NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          <template #icon>
            <NIcon><Checkmark24Regular /></NIcon>
          </template>
          确定
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { CreatePost, GetPostById, UpdatePost } from "@/api/system-management";
import type { ICreatePostParams, IUpdatePostParams } from "@/api/types";
import { Checkmark24Regular, Dismiss24Regular } from "@vicons/fluent";
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
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
import { statusOptions, type IPostRow } from "../data";

interface PostFormModel {
  postCode: string;
  postName: string;
  postSort: number;
  status: number;
  remark: string;
}

const createDefaultForm = (): PostFormModel => ({
  postCode: "",
  postName: "",
  postSort: 0,
  status: 1,
  remark: "",
});

const props = defineProps<{
  mode: "create" | "edit";
  record?: IPostRow | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>("show", { required: true });

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const formModel = ref<PostFormModel>(createDefaultForm());

const rules: FormRules = {
  postCode: [{ required: true, message: "请输入岗位编码", trigger: ["input", "blur"] }],
  postName: [{ required: true, message: "请输入岗位名称", trigger: ["input", "blur"] }],
};

const loadPostDetail = async () => {
  if (props.mode !== "edit" || !props.record) return;

  try {
    const post = await GetPostById(props.record.id);
    formModel.value = {
      postCode: post.postCode,
      postName: post.postName,
      postSort: post.postSort ?? 0,
      status: post.status,
      remark: post.remark ?? "",
    };
  } catch {
    resetFormFromRecord();
  }
};

const resetFormFromRecord = () => {
  if (props.mode === "edit" && props.record) {
    formModel.value = {
      postCode: props.record.postCode,
      postName: props.record.postName,
      postSort: props.record.postSort ?? 0,
      status: props.record.status,
      remark: props.record.remark ?? "",
    };
    return;
  }

  formModel.value = createDefaultForm();
};

const buildPayload = (): ICreatePostParams | IUpdatePostParams => ({
  postCode: formModel.value.postCode.trim(),
  postName: formModel.value.postName.trim(),
  postSort: formModel.value.postSort,
  status: formModel.value.status,
  remark: formModel.value.remark.trim() || undefined,
});

const handleCancel = () => {
  visible.value = false;
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

  const payload = buildPayload();

  try {
    submitting.value = true;

    if (props.mode === "edit" && props.record) {
      await UpdatePost(props.record.id, payload);
      message.success("修改成功");
    } else {
      await CreatePost(payload as ICreatePostParams);
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
      await loadPostDetail();
    } else {
      resetFormFromRecord();
    }
  },
);
</script>

<style scoped></style>
