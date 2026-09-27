import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-console": ["error", { allow: ["error", "warn"] }],
      // Aturan ini hanya memberi tahu bahwa React Compiler melewati komponen yang
      // memakai useReactTable. React Compiler tidak diaktifkan di proyek ini
      // (next.config.ts tanpa reactCompiler), jadi peringatannya tidak berlaku.
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/types/api.d.ts"]),
]);

export default eslintConfig;
