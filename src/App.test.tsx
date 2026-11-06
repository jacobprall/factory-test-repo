import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

describe("App", () => {
  it("should pass a basic sanity check", () => {
    expect(1 + 1).toBe(2);
  });
});

describe("index.html", () => {
  const html = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../index.html"),
    "utf-8"
  );

  it("has title 'Todos'", () => {
    expect(html).toContain("<title>Todos</title>");
  });

  it("has meta description", () => {
    expect(html).toContain(
      'content="A small todo app built with Vite, React and TypeScript."'
    );
  });
});
