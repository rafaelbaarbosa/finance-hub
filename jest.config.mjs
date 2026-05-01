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
};

export default createJestConfig(customConfig);
