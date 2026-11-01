import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const productionBase = process.env.VITE_BASE_PATH || (repoName ? `/${repoName}/` : "/");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  base: process.env.NODE_ENV === "production" ? productionBase : "/",
  build: {
    outDir: "dist",
  },
});
