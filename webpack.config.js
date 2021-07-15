const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let entry, output;
if (process.env.NPM_PACKAGE) {
  entry = './src/solidus_nexio.js';
  output = {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  };
} else {
  entry = './src/index-assets.js';
  output = {
    path: path.resolve(__dirname, 'app', 'assets', 'javascripts', 'solidus_nexio'),
    filename: 'checkout.js'
  };
}

const config = {
  entry: entry,
  output: output,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [new CleanWebpackPlugin()]
};

module.exports = config;
