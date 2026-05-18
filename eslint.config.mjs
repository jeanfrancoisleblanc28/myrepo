import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Tightened in eslint-plugin-react-hooks v7 (shipped with Next 16) to enforce
      // React Compiler constraints. Existing components predate these rules; keep as
      // warnings until refactored, rather than blocking CI.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default config;
