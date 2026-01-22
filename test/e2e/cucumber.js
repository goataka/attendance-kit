module.exports = {
  default: {
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
