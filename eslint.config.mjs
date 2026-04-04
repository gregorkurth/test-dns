import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "capabilities/**",
      "docs/**",
      "features/**",
      "req-init/**",
      "presentation/**",
      "public/**",
    ],
  },
];

export default config;
