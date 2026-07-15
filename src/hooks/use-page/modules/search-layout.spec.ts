import { describe, expect, it } from "vitest";
import { calculateSearchColumns } from "./search-layout";

describe("calculateSearchColumns", () => {
  it.each([
    [1240, 4],
    [992, 3],
    [744, 2],
    [496, 1],
  ])("reserves the action area at %ipx and renders %i field columns", (width, columns) => {
    expect(calculateSearchColumns(width, 4, 8)).toBe(columns);
  });

  it("never exceeds the configured maximum or field count", () => {
    expect(calculateSearchColumns(1600, 3, 8)).toBe(3);
    expect(calculateSearchColumns(1600, 4, 2)).toBe(2);
  });
});
