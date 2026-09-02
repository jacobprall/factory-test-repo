import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Bind to the loopback address explicitly: the default host ("localhost")
  // makes Vite resolve it through DNS, which fails in sandboxed/CI
  // environments without a "localhost" entry (ENOTFOUND) and aborts Vitest.
  server: {
    host: "127.0.0.1",
  },
  test: {
    environment: "jsdom",
  },
});
