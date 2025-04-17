/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts'],
  roots: ['<rootDir>/src'],
};
