import { describe, expect, it, vi } from "vitest";
import { CreateColumns, IsSuperAdminRole, type IRoleRow } from "./data";

const adminRole = { roleKey: "admin" } as IRoleRow;

describe("role management super admin rules", () => {
  it("hides every row action for the admin role", () => {
    const columns = CreateColumns({ onEdit: vi.fn() });
    const actions = columns.find((column) => "type" in column && column.type === "actions");

    expect(IsSuperAdminRole(adminRole)).toBe(true);
    expect(
      actions && "actions" in actions ? actions.actions.every((action) => action.show?.(adminRole) === false) : false,
    ).toBe(true);
  });
});
