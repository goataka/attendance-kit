module.exports = {
  // Backend TypeScriptファイル: ESLint実行のみ（formatはESLint内でPrettier連携済み）
  'apps/backend/**/*.{ts,tsx}': () => [
    `npm run lint -w @attendance-kit/backend`,
  ],
  // Frontend TypeScriptファイル: ESLint実行
  'apps/frontend/**/*.{ts,tsx}': () => [
    `npm run lint -w @attendance-kit/frontend`,
  ],
  // Markdownファイル: Prettier実行
  '**/*.md': (filenames) => `prettier --write ${filenames.join(' ')}`,
  // YAMLファイル: Prettier実行
  '**/*.{yml,yaml}': (filenames) => `prettier --write ${filenames.join(' ')}`,
};
