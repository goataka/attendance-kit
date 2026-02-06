// GitHub Actions以外のYAMLファイルをフィルタリング
const filterNonGitHubYaml = (filenames) => {
  return filenames.filter((file) => !file.startsWith('.github/'));
};

module.exports = {
  // TypeScript - Backend
  'apps/backend/**/*.{ts,tsx}': () => 'npm run lint -w @attendance-kit/backend',

  // TypeScript - Frontend
  'apps/frontend/**/*.{ts,tsx}': () => 'npm run lint -w @attendance-kit/frontend',

  // Shell Scripts
  '**/*.sh': (filenames) => `shellcheck ${filenames.join(' ')}`,

  // GitHub Actions YAML
  '.github/{workflows,actions}/**/*.{yml,yaml}': () => 'npm run lint:actionlint',

  // Markdown
  '**/*.md': (filenames) => `prettier --write ${filenames.join(' ')}`,

  // YAML (GitHub Actions以外)
  '**/*.{yml,yaml}': (filenames) => {
    const files = filterNonGitHubYaml(filenames);
    return files.length > 0 ? `prettier --write ${files.join(' ')}` : [];
  },
};
