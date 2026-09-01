import { describe, it, expect } from "vitest";
import { capitalize, slugify, truncate } from "./strings";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves an already capitalized string unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("handles a single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("handles an empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("does not change the rest of the string", () => {
    expect(capitalize("hello World")).toBe("Hello World");
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens and lowercases", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses repeated whitespace and trims edges", () => {
    expect(slugify("  Foo   Bar  ")).toBe("foo-bar");
  });

  it("collapses repeated hyphens", () => {
    expect(slugify("foo -- bar")).toBe("foo-bar");
  });

  it("handles an empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles a single character", () => {
    expect(slugify("A")).toBe("a");
  });

  it("keeps digits", () => {
    expect(slugify("Top 10 Tips")).toBe("top-10-tips");
  });
});

describe("truncate", () => {
  it("truncates longer strings and appends an ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("leaves a string exactly at maxLength unchanged", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("leaves a string under maxLength unchanged", () => {
    expect(truncate("Hi", 5)).toBe("Hi");
  });

  it("handles an empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles a single character at or under maxLength", () => {
    expect(truncate("a", 1)).toBe("a");
    expect(truncate("a", 5)).toBe("a");
  });

  it("returns only the ellipsis when maxLength is zero or negative", () => {
    expect(truncate("Hello", 0)).toBe("...");
    expect(truncate("Hello", -3)).toBe("...");
  });
});
