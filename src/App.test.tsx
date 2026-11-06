import { describe, it, expect } from "vitest";
import { remainingLabel } from "./App";

describe("remainingLabel", () => {
  it("returns '0 items left' for zero", () => {
    expect(remainingLabel(0)).toBe("0 items left");
  });

  it("returns '1 item left' for one", () => {
    expect(remainingLabel(1)).toBe("1 item left");
  });

  it("returns '2 items left' for two", () => {
    expect(remainingLabel(2)).toBe("2 items left");
  });
});
