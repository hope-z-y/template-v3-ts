import { describe, expect, it, vi } from "vitest";
import { buildColumns } from "./columns";

describe("buildColumns", () => {
  it("passes row-level disabled rules to selection columns", () => {
    const disabled = vi.fn(() => true);
    const [column] = buildColumns([{ type: "selection", disabled }], {
      hasPermission: () => true,
      getPageOffset: () => 0,
      visibleKeys: new Set(),
      confirmAction: vi.fn(),
    });

    expect(column).toMatchObject({ type: "selection", disabled });
  });
});
