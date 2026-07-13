import { useUserStore } from "@/stores";
import { effectScope, shallowRef, watchEffect, type Directive, type EffectScope, type Ref } from "vue";

const permissionScopeMap = new WeakMap<HTMLElement, EffectScope>();
const permissionValueMap = new WeakMap<HTMLElement, Ref<string | string[] | undefined>>();
const originalDisplayMap = new WeakMap<HTMLElement, string>();

/**
 * 权限指令接收一个权限标识或权限标识数组。
 *
 * 使用示例：
 * <NButton v-permission="'system:user:create'">新增</NButton>
 * <NButton v-permission="['system:user:create', 'system:user:update']">保存</NButton>
 */
const canAccess = (value?: string | string[]) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return true;
  return useUserStore().hasPermission(value);
};

const applyPermission = (el: HTMLElement, value?: string | string[]) => {
  if (!originalDisplayMap.has(el)) {
    originalDisplayMap.set(el, el.style.display);
  }

  const originalDisplay = originalDisplayMap.get(el) ?? "";
  el.style.display = canAccess(value) ? originalDisplay : "none";
};

/**
 * v-permission 会在元素挂载或更新时检查权限。
 * 这里使用 watchEffect 监听 Pinia 中的权限变化：
 * 登录后权限异步加载完成时，按钮会自动显示或隐藏，避免刷新页面时误判。
 */
export const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const permissionValue = shallowRef(binding.value);
    const scope = effectScope();
    scope.run(() => {
      watchEffect(() => {
        applyPermission(el, permissionValue.value);
      });
    });
    permissionScopeMap.set(el, scope);
    permissionValueMap.set(el, permissionValue);
  },
  updated(el, binding) {
    const permissionValue = permissionValueMap.get(el);
    if (permissionValue) {
      permissionValue.value = binding.value;
    } else {
      applyPermission(el, binding.value);
    }
  },
  unmounted(el) {
    permissionScopeMap.get(el)?.stop();
    permissionScopeMap.delete(el);
    permissionValueMap.delete(el);
    originalDisplayMap.delete(el);
  },
};
