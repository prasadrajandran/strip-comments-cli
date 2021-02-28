const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './src/cli.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname, 'dist'),
  },
};