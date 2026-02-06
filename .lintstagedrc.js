module.exports = {
  // Backend TypeScriptファイル: ESLint実行のみ（formatはESLint内でPrettier連携済み）
  'apps/backend/**/*.{ts,tsx}': () => [
    `npm run lint -w @attendance-kit/backend`,
  ],
  // Frontend TypeScriptファイル: ESLint実行
  'apps/frontend/**/*.{ts,tsx}': () => [
    `npm run lint -w @attendance-kit/frontend`,
  ],
  // シェルスクリプト: shellcheck実行
  '**/*.sh': (filenames) => `shellcheck ${filenames.join(' ')}`,
  // GitHub Actions YAMLファイル: actionlint実行
  '.github/{workflows,actions}/**/*.{yml,yaml}': () => [
    `npm run lint:actionlint`,
  ],
  // Markdownファイル: Prettier実行
  '**/*.md': (filenames) => `prettier --write ${filenames.join(' ')}`,
  // 一般的なYAMLファイル: Prettier実行（GitHub Actions以外）
  '**/*.{yml,yaml}': (filenames) => {
    const nonGitHubFiles = filenames.filter(
      (file) => !file.startsWith('.github/')
    );
    return nonGitHubFiles.length > 0
      ? `prettier --write ${nonGitHubFiles.join(' ')}`
      : [];
  },
};
