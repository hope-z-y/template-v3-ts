<template>
  <section class="flex size-full items-center justify-center bg-[#f6f8fb] p-6 dark:bg-[#101014]">
    <div class="w-full max-w-xl text-center">
      <p class="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-sky-500">404</p>
      <h1 class="m-0 text-3xl font-semibold text-black/88 dark:text-white/90">页面不存在</h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
        你访问的页面不存在，或对应的菜单组件尚未接入当前前端模板。
      </p>
      <div class="mt-8 flex justify-center gap-3">
        <NButton @click="goBack">返回上一页</NButton>
        <NButton type="primary" @click="goHome">回到首页</NButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui";
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => router.back();
const goHome = () => router.replace("/home");
</script>
