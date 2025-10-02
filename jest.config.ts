/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  testEnvironment: "node",
  clearMocks: true,
  rootDir: "./",
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/constants/",
    "!<rootDir>/src/**/index.ts",
    "!<rootDir>/src/**/types/",
    "!<rootDir>/src/**/*.test.ts",
    "!<rootDir>/src/**/*.spec.ts"
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules"],
  coverageReporters: ["json", "html"],
  testMatch: [
    "<rootDir>/src/tests/**/*.{test,spec}.ts",
    "<rootDir>/src/**/*.{test,spec}.ts"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.ts$": "babel-jest"
  },
};

export default config;
