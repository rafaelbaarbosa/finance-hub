import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
  },
  testMatch: ['**/?(*.)+(test).js?(x)'],
  collectCoverageFrom: [
    'app/api/**/*.js',
    'components/**/*.jsx',
    '!components/ui/**',
    '!components/**/index.js',
    '!components/**/tests/**',
    '!components/ExpenseChart/**',
    '!components/UploadArea/**',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 75,
      functions: 85,
      lines: 95,
    },
  },
};

export default createJestConfig(customConfig);
