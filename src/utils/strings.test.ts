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

  it("leaves strings starting with a digit unchanged", () => {
    expect(capitalize("9test")).toBe("9test");
  });

  it("leaves strings starting with a symbol unchanged", () => {
    expect(capitalize("@hello")).toBe("@hello");
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("uppercases an accented first letter", () => {
    expect(capitalize("élan")).toBe("Élan");
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

  it("keeps digit-only input intact", () => {
    expect(slugify("123")).toBe("123");
    expect(slugify("2024 07")).toBe("2024-07");
  });

  it("strips underscores", () => {
    expect(slugify("hello_world")).toBe("helloworld");
    expect(slugify("hello _ world")).toBe("hello-world");
  });

  it("strips accented characters rather than transliterating them", () => {
    expect(slugify("café")).toBe("caf");
    expect(slugify("naïve idea")).toBe("nave-idea");
  });

  it("strips non-Latin characters", () => {
    expect(slugify("Москва")).toBe("");
    expect(slugify("Москва 2024")).toBe("2024");
  });

  it("returns an empty string for punctuation-only input", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("@#$%")).toBe("");
    expect(slugify("   ")).toBe("");
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
    expect(truncate("Hello", -1)).toBe("...");
    expect(truncate("Hello", -3)).toBe("...");
    expect(truncate("Hello", -5)).toBe("...");
    expect(truncate("Hello", -100)).toBe("...");
  });

  it("returns only the ellipsis for empty input with a negative maxLength", () => {
    expect(truncate("", -1)).toBe("...");
  });
});
