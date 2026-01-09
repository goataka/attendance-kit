module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/test/integration/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'bin/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
