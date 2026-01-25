module.exports = {
  default: {
    paths: ['test/e2e/features/**/*.feature'],
    require: ['test/e2e/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:test/e2e/reports/cucumber-report.html',
      'json:test/e2e/reports/cucumber-report.json'
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
