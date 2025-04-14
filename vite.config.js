import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "b772-2401-4900-1c80-7ca4-387a-2410-1bf6-5c02.ngrok-free.app",
    ],
  },
});
