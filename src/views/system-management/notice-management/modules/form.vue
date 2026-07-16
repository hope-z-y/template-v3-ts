<template>
  <Modal>
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="86">
      <NFormItem label="标题" path="title">
        <NInput v-model:value="form.title" maxlength="200" show-count placeholder="请输入通知公告标题" />
      </NFormItem>
      <div class="grid grid-cols-2 gap-x-4">
        <NFormItem label="类型" path="type">
          <NSelect v-model:value="form.type" :options="NoticeTypeOptions" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect v-model:value="form.status" :options="NoticeStatusOptions" />
        </NFormItem>
      </div>
      <NFormItem label="发布时间" path="publishAt">
        <NDatePicker v-model:value="form.publishAt" type="datetime" clearable class="w-full" />
      </NFormItem>
      <NFormItem label="接收范围" path="targetType">
        <NSelect
          v-model:value="form.targetType"
          :options="NoticeTargetTypeOptions"
          @update:value="form.targetIds = []"
        />
      </NFormItem>
      <NFormItem v-if="form.targetType !== 'all'" label="接收目标" path="targetIds">
        <NSelect
          v-model:value="form.targetIds"
          multiple
          filterable
          :loading="targetLoading"
          :options="targetOptions"
          :placeholder="targetPlaceholder"
        />
      </NFormItem>
      <NAlert
        v-if="form.status === 'published' && form.publishAt && form.publishAt > Date.now()"
        type="info"
        class="mb-4"
        >将在设定时间自动分发给接收用户
      </NAlert>
      <NFormItem label="正文" path="content"
        ><NInput
          v-model:value="form.content"
          type="textarea"
          maxlength="10000"
          show-count
          placeholder="请输入通知公告正文"
          :autosize="{ minRows: 8, maxRows: 14 }" /></NFormItem
      ><NFormItem label="备注" path="remark"
        ><NInput
          v-model:value="form.remark"
          type="textarea"
          maxlength="500"
          show-count
          :autosize="{ minRows: 2, maxRows: 4 }" /></NFormItem></NForm
  ></Modal>
</template>
<script setup lang="ts">
import { CreateNotice, GetNoticeById, GetNoticeTargetOptions, UpdateNotice } from "@/api/system-management";
import type {
  ICreateNoticeParams,
  INoticeTargetOptions,
  NoticeStatus,
  NoticeTargetType,
  NoticeType,
} from "@/api/types";
import { useModal } from "@/hooks";
import {
  NAlert,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { computed, ref } from "vue";
import { NoticeStatusOptions, NoticeTargetTypeOptions, NoticeTypeOptions, type INoticeModalData } from "../data";
interface FormModel {
  title: string;
  type: NoticeType;
  status: NoticeStatus;
  publishAt: number | null;
  content: string;
  remark: string;
  targetType: NoticeTargetType;
  targetIds: string[];
}
const DefaultForm = (): FormModel => ({
  title: "",
  type: "notice",
  status: "draft",
  publishAt: null,
  content: "",
  remark: "",
  targetType: "all",
  targetIds: [],
});
const emit = defineEmits<{ success: [] }>();
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const form = ref(DefaultForm());
const targets = ref<INoticeTargetOptions>({ departments: [], roles: [], users: [] });
const targetLoading = ref(false);
const targetOptions = computed(() => {
  if (form.value.targetType === "department")
    return targets.value.departments.map((item) => ({ label: item.deptName, value: item.id }));
  if (form.value.targetType === "role")
    return targets.value.roles.map((item) => ({ label: `${item.roleName}（${item.roleKey}）`, value: item.id }));
  if (form.value.targetType === "user")
    return targets.value.users.map((item) => ({ label: `${item.username}（${item.account}）`, value: item.id }));
  return [];
});
const targetPlaceholder = computed(
  () => ({ department: "请选择部门", role: "请选择角色", user: "请选择用户", all: "" })[form.value.targetType],
);
const [Modal, modalApi] = useModal<INoticeModalData>({
  title: (data) => (data?.mode === "edit" ? "编辑通知公告" : "新增通知公告"),
  width: "680px",
  onConfirm: Submit,
  onOpened: Open,
  onClosed: () => {
    form.value = DefaultForm();
    formRef.value?.restoreValidation();
  },
});
async function Open(data: INoticeModalData) {
  targetLoading.value = true;
  try {
    targets.value = await GetNoticeTargetOptions();
  } finally {
    targetLoading.value = false;
  }
  if (data.mode !== "edit" || !data.record) return;
  try {
    const item = await GetNoticeById(data.record.id);
    form.value = {
      title: item.title,
      type: item.type,
      status: item.status,
      publishAt: item.publishAt ? new Date(item.publishAt).getTime() : null,
      content: item.content,
      remark: item.remark || "",
      targetType: item.targetType,
      targetIds: item.targetIds,
    };
  } catch {
    form.value = {
      title: data.record.title,
      type: data.record.type,
      status: data.record.status,
      publishAt: data.record.publishAt ? new Date(data.record.publishAt).getTime() : null,
      content: data.record.content,
      remark: data.record.remark || "",
      targetType: data.record.targetType,
      targetIds: data.record.targetIds,
    };
  }
}
async function Submit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  const payload: ICreateNoticeParams = {
    title: form.value.title.trim(),
    type: form.value.type,
    status: form.value.status,
    publishAt: form.value.publishAt ? new Date(form.value.publishAt).toISOString() : undefined,
    content: form.value.content.trim(),
    remark: form.value.remark.trim() || undefined,
    targetType: form.value.targetType,
    targetIds: form.value.targetIds,
  };
  const data = modalApi.getData();
  try {
    modalApi.lock();
    if (data.mode === "edit" && data.record) await UpdateNotice(data.record.id, payload);
    else await CreateNotice(payload);
    message.success(data.mode === "edit" ? "修改成功" : "新增成功");
    modalApi.close();
    emit("success");
  } finally {
    modalApi.unlock();
  }
}
const rules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: ["input", "blur"] }],
  content: [{ required: true, message: "请输入正文", trigger: ["input", "blur"] }],
  targetIds: [
    {
      validator: () => form.value.targetType === "all" || form.value.targetIds.length > 0,
      message: "请选择接收目标",
      trigger: "change",
    },
  ],
};
</script>
