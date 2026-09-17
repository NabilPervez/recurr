import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://nabilpervez.github.io/recurr/
export default defineConfig({
  base: "/recurr/",
  plugins: [react()],
});
