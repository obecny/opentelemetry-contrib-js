module.exports = {
  listenAddress: 'localhost',
  hostname: 'localhost',
  browsers: ['ChromeHeadless'],
  frameworks: ['mocha'],
  coverageIstanbulReporter: {
    reports: ['json'],
    dir: '.nyc_output',
    fixWebpackSourcePaths: true
  },
  reporters: ['spec', 'coverage-istanbul'],
  files: ['test/index-webpack.ts'],
  preprocessors: { 'test/index-webpack.ts': ['webpack'] },
  webpackMiddleware: { noInfo: true }
};
