import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import checker from "vite-plugin-checker";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === "development" && checker({ typescript: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
