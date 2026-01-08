import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      // Ensure a single React instance across the bundle (helps avoid runtime crashes).
      dedupe: ["react", "react-dom", "scheduler"],
    },
    plugins: [
      react(),
      {
        name: "strip-signalr-pure-annotations",
        enforce: "pre",
        transform(code, id) {
          if (id.includes("@microsoft/signalr/dist/esm/Utils.js")) {
            // Rollup warns about these annotations in this file; it removes them anyway.
            // Stripping them pre-transform avoids noisy build warnings without changing behavior.
            return code.replaceAll("/*#__PURE__*/", "");
          }

          return null;
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll("\\\\", "/");

            // Split app code into stable chunks to keep any single file under the warning threshold.
            // This does not change runtime behavior; it only affects bundling.
            if (normalizedId.includes("/src/")) {
              if (normalizedId.includes("/src/pages/")) return "pages";
              if (normalizedId.includes("/src/components/"))
                return "components";
              if (normalizedId.includes("/src/api/")) return "api";
              if (
                normalizedId.includes("/src/context") ||
                normalizedId.includes("/src/contexts/")
              )
                return "state";
              if (normalizedId.includes("/src/hooks/")) return "hooks";
              if (normalizedId.includes("/src/utils/")) return "utils";
              if (normalizedId.includes("/src/i18n/")) return "i18n";

              return "app";
            }

            if (!normalizedId.includes("node_modules")) return;

            if (normalizedId.includes("@microsoft/signalr")) return "signalr";
            if (
              normalizedId.includes("recharts") ||
              normalizedId.includes("/d3-")
            )
              return "charts";

            if (
              // Keep *only* React core + its scheduler in a dedicated chunk.
              // This avoids a circular dependency where vendor imports react and react imports vendor.
              normalizedId.includes("/react/") ||
              normalizedId.includes("/react-dom/") ||
              normalizedId.includes("/scheduler/")
            ) {
              return "react";
            }

            if (
              normalizedId.includes("@headlessui") ||
              normalizedId.includes("@heroicons") ||
              normalizedId.includes("react-icons")
            ) {
              return "ui";
            }

            return "vendor";
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      },
    },
  };
});
