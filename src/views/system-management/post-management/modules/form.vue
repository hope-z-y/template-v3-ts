<!-- 岗位管理 -> 新增 / 编辑表单（useModal 内容方：只写表单本身，弹窗外壳由 useModal 提供） -->

<template>
  <Modal>
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
import { CreatePost, GetPostById, UpdatePost } from "@/api/system-management";
import type { CommonStatus, ICreatePostParams, IUpdatePostParams } from "@/api/types";
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
import { CommonStatusOptions } from "@/utils/constant";
import { computed, ref } from "vue";
import type { IPostModalData } from "../data";

interface PostFormModel {
  postCode: string;
  postName: string;
  postSort: number;
  status: CommonStatus;
  remark: string;
}

const createDefaultForm = (): PostFormModel => ({
  postCode: "",
  postName: "",
  postSort: 0,
  status: "enabled",
  remark: "",
});

const emit = defineEmits<{
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = ref<PostFormModel>(createDefaultForm());

// 内容方 useModal：声明弹窗行为，与列表页的 formModalApi 共享同一份状态。
// mode / record 不再走 props，统一从 modalApi.getData() 读取
const [Modal, modalApi] = useModal<IPostModalData>({
  // title / onOpened 的入参就是列表页 setData 传入的数据
  title: (data) => (data?.mode === "edit" ? "编辑岗位" : "新增岗位"),
  onConfirm: handleSubmit,
  onOpened: handleOpened,
  // 关闭动画结束后重置表单与校验状态，下次打开是干净的
  onClosed: () => {
    formRef.value?.restoreValidation();
    formModel.value = createDefaultForm();
  },
});

const mode = computed(() => modalApi.getData()?.mode ?? "create");

/** 弹窗打开：编辑模式拉取详情回填，新增模式使用默认值 */
async function handleOpened(data: IPostModalData) {
  if (data?.mode !== "edit" || !data.record) {
    formModel.value = createDefaultForm();
    return;
  }

  try {
    const post = await GetPostById(data.record.id);
    formModel.value = {
      postCode: post.postCode,
      postName: post.postName,
      postSort: post.postSort ?? 0,
      status: post.status,
      remark: post.remark ?? "",
    };
  } catch {
    // 详情接口失败时降级用列表行数据回填
    formModel.value = {
      postCode: data.record.postCode,
      postName: data.record.postName,
      postSort: data.record.postSort ?? 0,
      status: data.record.status,
      remark: data.record.remark ?? "",
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

  const payload: ICreatePostParams | IUpdatePostParams = {
    postCode: formModel.value.postCode.trim(),
    postName: formModel.value.postName.trim(),
    postSort: formModel.value.postSort,
    status: formModel.value.status,
    remark: formModel.value.remark.trim() || undefined,
  };

  const data = modalApi.getData();

  try {
    // lock/unlock 控制确认按钮的 loading，防止重复提交
    modalApi.lock();

    if (data?.mode === "edit" && data.record) {
      await UpdatePost(data.record.id, payload);
      message.success("修改成功");
    } else {
      await CreatePost(payload as ICreatePostParams);
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

const rules: FormRules = {
  postCode: [{ required: true, message: "请输入岗位编码", trigger: ["input", "blur"] }],
  postName: [{ required: true, message: "请输入岗位名称", trigger: ["input", "blur"] }],
};
</script>

<style scoped></style>
