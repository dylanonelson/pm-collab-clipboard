const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'demo/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'demo'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'demo'),
    port: 1104,
  },
};
