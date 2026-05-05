module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance':    ['error', { minScore: 0.8 }],
        'categories:accessibility':  ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'largest-contentful-paint':  ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift':   ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time':       ['warn',  { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
