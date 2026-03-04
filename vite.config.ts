import { defineConfig } from "vite";

import { version } from "./package.json";

export default defineConfig({
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(version),
  },
  worker: {
    format: "es",
  },
});
