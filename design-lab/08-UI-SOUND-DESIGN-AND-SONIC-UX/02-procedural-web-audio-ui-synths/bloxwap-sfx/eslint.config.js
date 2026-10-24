import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/out/**', '**/.source/**', '.tools/**', '.hig-reference/**'] },
  { files: ['packages/sfx/src/**/*.ts', 'apps/docs/components/**/*.tsx'], extends: [tseslint.configs.recommended] },
);
