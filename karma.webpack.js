const webpackNodePolyfills = require('./webpack.node-polyfills.js');

// This is the webpack configuration for browser Karma tests with coverage.
module.exports = {
  mode: 'development',
  target: 'web',
  output: { filename: 'bundle.js' },
  resolve: { extensions: ['.ts', '.js'] },
  devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      {
        enforce: 'post',
        exclude: /(node_modules|\.test\.[tj]sx?$)/,
        test: /\.ts$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        }
      },
      // This setting configures Node polyfills for the browser that will be
      // added to the webpack bundle for Karma tests.
      { parser: { node: webpackNodePolyfills } }
    ]
  }
};
