import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const normalizeBase = (value) => {
  if (!value) {
    return "/REPO_NAME/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBase(env.VITE_BASE_PATH);

  return {
    plugins: [react()],
    // Sostituisci REPO_NAME con il nome della repo GitHub oppure usa VITE_BASE_PATH in .env.
    base,
    build: {
      outDir: "dist",
    },
  };
});
