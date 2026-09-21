import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split heavy/independent libs into their own cacheable chunks so the
        // initial entry stays small. Pages are already React.lazy()'d.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("react-router")) return "router";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("lenis")) return "lenis";
          if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype") || id.includes("micromark") || id.includes("mdast")) return "markdown";
        },
      },
    },
  },
}));
