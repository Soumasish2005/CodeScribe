// packages/api/jest.config.js
import { pathsToModuleNameMapper } from 'ts-jest';
import fs from 'fs';
import path from 'path';

// Read and parse the tsconfig.json file manually
const tsconfigFile = fs.readFileSync(path.join(__dirname, '../../tsconfig.json'), 'utf8');
const { compilerOptions } = JSON.parse(tsconfigFile);

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Use the parsed compilerOptions
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../',
  }),
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
