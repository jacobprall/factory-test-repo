import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Bind explicitly to the loopback address: relying on the "localhost"
  // hostname requires DNS resolution that is not always available in CI.
  server: { host: "127.0.0.1" },
});
