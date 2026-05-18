import { describe, expect, it } from "vitest";

import { add, clamp } from "./math";

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});

describe("clamp", () => {
  it("clamps value within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
