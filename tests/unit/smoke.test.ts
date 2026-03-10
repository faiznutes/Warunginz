import { describe, expect, it } from "vitest";

describe("Test runner baseline", () => {
  it("runs unit tests without pulling Playwright specs", () => {
    expect(true).toBe(true);
  });
});
