// packages/worker/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@devnovate/shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  testMatch: ['**/tests/**/*.test.ts'],
};
