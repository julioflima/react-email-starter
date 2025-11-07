import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    noExternal: [/^@react-email\//], // Add regex here
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react-jsx",
      },
    },
  },
});
