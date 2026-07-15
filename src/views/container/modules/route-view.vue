<template>
  <RouterView v-slot="{ Component, route: viewRoute }">
    <Transition :name="transitionName" mode="out-in" :css="animationEnabled">
      <!--
        Transition 需要单一的真实 DOM 子节点；KeepAlive 本身不渲染元素，不能直接作为子节点。
        外层 div 始终存在，避免异步路由加载时 Component 为空导致 out-in 动画卡在空白态。
      -->
      <div :key="viewKey" class="size-full min-h-0 overflow-auto">
        <KeepAlive v-if="viewRoute.meta.keepAlive">
          <component :is="Component" v-if="Component" />
        </KeepAlive>
        <component :is="Component" v-else-if="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { useGlobalConfig } from "@/hooks";
import { useMenuTagStore } from "@/stores/menu-tag";
import { usePreferredReducedMotion } from "@vueuse/core";
import { computed, onBeforeUnmount, watchEffect } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const menuTagStore = useMenuTagStore();
const { routeAnimation } = useGlobalConfig();
const reducedMotion = usePreferredReducedMotion();

const viewKey = computed(() => menuTagStore.getViewKey(route.path));
const animationEnabled = computed(() => routeAnimation.value.enabled && reducedMotion.value !== "reduce");
const transitionName = computed(() => `route-${routeAnimation.value.type}`);
const transitionDuration = computed(() => ({ fast: 140, normal: 180, slow: 240 })[routeAnimation.value.speed]);

watchEffect(() => {
  document.documentElement.style.setProperty("--route-transition-duration", `${transitionDuration.value}ms`);
});
onBeforeUnmount(() => document.documentElement.style.removeProperty("--route-transition-duration"));
</script>

<style>
.route-fade-enter-active,
.route-fade-leave-active,
.route-fade-up-enter-active,
.route-fade-up-leave-active,
.route-fade-scale-enter-active,
.route-fade-scale-leave-active {
  transition:
    opacity var(--route-transition-duration) ease,
    transform var(--route-transition-duration) ease;
}

.route-fade-enter-from,
.route-fade-leave-to,
.route-fade-up-enter-from,
.route-fade-up-leave-to,
.route-fade-scale-enter-from,
.route-fade-scale-leave-to {
  opacity: 0;
}

.route-fade-up-enter-from,
.route-fade-up-leave-to {
  transform: translateY(8px);
}

.route-fade-scale-enter-from,
.route-fade-scale-leave-to {
  transform: scale(0.985);
}
</style>
