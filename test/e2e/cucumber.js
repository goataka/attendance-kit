module.exports = {
  default: {
    paths: ['test/e2e/features/**/*.feature'],
    import: ['test/e2e/steps/**/*.ts'],
    loader: ['ts-node/esm', 'tsconfig-paths/register'],
    format: [
      'progress',
      'html:test/e2e/reports/cucumber-report.html',
      'json:test/e2e/reports/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
