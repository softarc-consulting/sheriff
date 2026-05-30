import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import sheriff from "@softarc/eslint-plugin-sheriff";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ['app/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}', 'shell/**/*.{ts,tsx}'],
    ...sheriff.configs.all,
  },
];

export default eslintConfig;
