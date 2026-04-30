import { defineConfig } from "vite-plus";

import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    jsdoc: {},
    ignorePatterns: ["dist/**", "gen/**"],
    printWidth: 120,
    sortImports: {
      sortSideEffects: true,
      customGroups: [
        {
          groupName: "lit",
          elementNamePattern: ["lit", "@lit-labs/**", "@lit/**", "lit/**", "signal-utils/**"],
        },
        {
          groupName: "shoelace",
          elementNamePattern: ["@shoelace-style/**"],
        },
      ],
      groups: [
        "lit",
        "shoelace",
        ["value-builtin", "value-external"],
        "value-internal",
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
  },
  lint: {
    ignorePatterns: ["dist/**", "gen/**", "scripts/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "typescript/unbound-method": "off",
      "typescript/no-floating-promises": "off",
      "typescript/restrict-template-expressions": "off",
    },
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  worker: {
    format: "es",
  },
});
