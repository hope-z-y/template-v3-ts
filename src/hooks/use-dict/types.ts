import type { IDictData } from "@/api/types";
import type { ComputedRef, InjectionKey } from "vue";

export type DictValue = string | number | boolean | null | undefined;

export interface DictApi {
  getDictData: (dictType: string) => IDictData[];
  getDictItem: (dictType: string, value: DictValue) => IDictData | undefined;
  getDictLabel: (dictType: string, value: DictValue, fallback?: string) => string;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: ComputedRef<boolean>;
  loaded: ComputedRef<boolean>;
}

export const DICT_API_KEY: InjectionKey<DictApi> = Symbol("use-dict-api");
