import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/request", () => ({ request: requestMock }));

import { ChangeCurrentPassword, UpdateCurrentProfile, VerifyCurrentPassword } from ".";

describe("auth self-service contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses dedicated current-account endpoints", () => {
    UpdateCurrentProfile({ username: "New name" });
    VerifyCurrentPassword({ password: "encrypted-current" });
    ChangeCurrentPassword({ currentPassword: "encrypted-current", newPassword: "encrypted-new" });

    expect(requestMock.patch).toHaveBeenNthCalledWith(1, "/auth/profile", { username: "New name" });
    expect(requestMock.post).toHaveBeenCalledWith("/auth/verify-password", { password: "encrypted-current" });
    expect(requestMock.patch).toHaveBeenNthCalledWith(2, "/auth/password", {
      currentPassword: "encrypted-current",
      newPassword: "encrypted-new",
    });
  });
});
