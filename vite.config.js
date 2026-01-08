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
