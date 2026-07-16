import { GetAllDictData } from "@/api/system-management";
import type { IDictData, IGetAllDictDataResponse } from "@/api/types";
import { computed, provide, ref, shallowRef } from "vue";
import { DictTag } from "./dict-tag";
import { DICT_API_KEY, type DictApi, type DictValue } from "./types";

const dictCache = shallowRef<IGetAllDictDataResponse>({});
const loading = ref(false);
const loaded = ref(false);
let pendingRequest: Promise<void> | null = null;

const normalizeValue = (value: DictValue) => (value == null ? "" : String(value));

const normalizeDictData = (response: IGetAllDictDataResponse): IGetAllDictDataResponse => {
  return Object.fromEntries(
    Object.entries(response).map(([dictType, items]) => {
      const uniqueItems = new Map<string, IDictData>();

      for (const item of items) {
        if (!uniqueItems.has(item.dictValue)) {
          uniqueItems.set(item.dictValue, item);
        }
      }

      return [dictType, [...uniqueItems.values()]];
    }),
  );
};

export const SetAllDictData = (response: IGetAllDictDataResponse) => {
  dictCache.value = normalizeDictData(response);
  loaded.value = true;
};

const requestAllDictData = (): Promise<void> => {
  if (pendingRequest) return pendingRequest;

  loading.value = true;
  pendingRequest = GetAllDictData()
    .then((response) => {
      SetAllDictData(response);
    })
    .finally(() => {
      pendingRequest = null;
      loading.value = false;
    });

  return pendingRequest;
};

const dictApi: DictApi = {
  getDictData: (dictType) => dictCache.value[dictType] ?? [],
  getDictItem: (dictType, value) => {
    const normalizedValue = normalizeValue(value);
    return dictCache.value[dictType]?.find((item) => item.dictValue === normalizedValue);
  },
  getDictLabel: (dictType, value, fallback) => {
    return dictApi.getDictItem(dictType, value)?.dictLabel ?? fallback ?? normalizeValue(value);
  },
  load: async () => {
    if (loaded.value) return;
    await requestAllDictData();
  },
  refresh: requestAllDictData,
  loading: computed(() => loading.value),
  loaded: computed(() => loaded.value),
};

export const useDict = () => {
  provide(DICT_API_KEY, dictApi);
  void dictApi.load().catch(() => undefined);

  return [DictTag, dictApi] as const;
};
