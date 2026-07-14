/* eslint-disable vue/one-component-per-file */
import type { IDictData, IGetAllDictDataResponse } from "@/api/types";
import { flushPromises, mount } from "@vue/test-utils";
import { NTag } from "naive-ui";
import { defineComponent, h, nextTick, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DictApi } from "./types";

const getAllDictDataMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/system-management", () => ({
  GetAllDictData: getAllDictDataMock,
}));

const createDictItem = (
  dictTypeId: string,
  dictValue: string,
  dictLabel: string,
  overrides: Partial<IDictData> = {},
): IDictData => ({
  id: `${dictTypeId}-${dictValue}-${dictLabel}`,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdById: null,
  updatedById: null,
  remark: null,
  dictTypeId,
  dictValue,
  dictLabel,
  cssClass: null,
  listClass: null,
  isDefault: false,
  sort: 1,
  status: "enabled",
  ...overrides,
});

const importUseDict = async () => {
  return (await import("./use-dict")).useDict;
};

describe("useDict", () => {
  beforeEach(() => {
    vi.resetModules();
    getAllDictDataMock.mockReset();
  });

  it("merges concurrent automatic loads from multiple DictTag instances", async () => {
    let resolveRequest!: (response: IGetAllDictDataResponse) => void;
    getAllDictDataMock.mockImplementation(
      () =>
        new Promise<IGetAllDictDataResponse>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const useDict = await importUseDict();

    const Child = defineComponent({
      setup() {
        const [DictTag] = useDict();
        return () => h(DictTag, { dictType: "common_status", value: "1" });
      },
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          return () => h("div", [h(Child), h(Child), h(Child)]);
        },
      }),
    );

    expect(getAllDictDataMock).toHaveBeenCalledTimes(1);

    resolveRequest({ common_status: [createDictItem("status", "1", "Enabled")] });
    await flushPromises();

    expect(wrapper.findAll(".n-tag")).toHaveLength(3);
    expect(wrapper.text()).toBe("EnabledEnabledEnabled");
  });

  it("deduplicates by dictionary type and value without cross-type conflicts", async () => {
    getAllDictDataMock.mockResolvedValue({
      common_status: [createDictItem("status", "1", "Enabled"), createDictItem("status", "1", "Duplicate")],
      gender: [createDictItem("gender", "1", "Male")],
    } satisfies IGetAllDictDataResponse);
    const useDict = await importUseDict();
    let dictApi!: DictApi;

    mount(
      defineComponent({
        setup() {
          const [, api] = useDict();
          dictApi = api;
          return () => null;
        },
      }),
    );
    await flushPromises();

    expect(dictApi.getDictData("common_status")).toHaveLength(1);
    expect(dictApi.getDictLabel("common_status", 1)).toBe("Enabled");
    expect(dictApi.getDictLabel("gender", 1)).toBe("Male");
  });

  it("replaces the shared cache on refresh and updates mounted tags", async () => {
    getAllDictDataMock
      .mockResolvedValueOnce({ common_status: [createDictItem("status", "1", "Old label")] })
      .mockResolvedValueOnce({ common_status: [createDictItem("status", "1", "New label")] });
    const useDict = await importUseDict();
    let dictApi!: DictApi;

    const wrapper = mount(
      defineComponent({
        setup() {
          const [DictTag, api] = useDict();
          dictApi = api;
          return () => h(DictTag, { dictType: "common_status", value: "1" });
        },
      }),
    );
    await flushPromises();
    expect(wrapper.text()).toBe("Old label");

    await dictApi.refresh();
    await nextTick();

    expect(wrapper.text()).toBe("New label");
  });

  it("reacts to reused component values and applies listClass and cssClass", async () => {
    getAllDictDataMock.mockResolvedValue({
      common_status: [
        createDictItem("status", "1", "Enabled", { listClass: "success" }),
        createDictItem("status", "0", "Disabled", { cssClass: "dict-disabled", listClass: "danger" }),
      ],
    } satisfies IGetAllDictDataResponse);
    const useDict = await importUseDict();
    const currentValue = ref("1");

    const wrapper = mount(
      defineComponent({
        setup() {
          const [DictTag] = useDict();
          return () => h(DictTag, { dictType: "common_status", value: currentValue.value });
        },
      }),
    );
    await flushPromises();
    expect(wrapper.text()).toBe("Enabled");
    expect(wrapper.findComponent(NTag).props("type")).toBe("success");

    currentValue.value = "0";
    await nextTick();

    expect(wrapper.text()).toBe("Disabled");
    expect(wrapper.findComponent(NTag).props("type")).toBe("error");
    expect(wrapper.find(".n-tag").classes()).toContain("dict-disabled");
  });

  it("shows fallback or the original value when an item is missing", async () => {
    getAllDictDataMock.mockResolvedValue({});
    const useDict = await importUseDict();

    const wrapper = mount(
      defineComponent({
        setup() {
          const [DictTag] = useDict();
          return () =>
            h("div", [
              h(DictTag, { dictType: "missing", value: 7 }),
              h(DictTag, { dictType: "missing", value: 8, fallback: "Unknown" }),
            ]);
        },
      }),
    );
    await flushPromises();

    expect(wrapper.text()).toBe("7Unknown");
  });

  it("allows load to retry after the initial request fails", async () => {
    getAllDictDataMock
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ common_status: [createDictItem("status", "1", "Enabled")] });
    const useDict = await importUseDict();
    let dictApi!: DictApi;

    mount(
      defineComponent({
        setup() {
          const [, api] = useDict();
          dictApi = api;
          return () => null;
        },
      }),
    );
    await flushPromises();

    expect(dictApi.loaded.value).toBe(false);
    expect(dictApi.loading.value).toBe(false);

    await dictApi.load();

    expect(getAllDictDataMock).toHaveBeenCalledTimes(2);
    expect(dictApi.loaded.value).toBe(true);
    expect(dictApi.getDictLabel("common_status", "1")).toBe("Enabled");
  });
});
