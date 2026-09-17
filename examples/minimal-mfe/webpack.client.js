const path = require('path')
const { ModuleFederationPlugin } = require('@module-federation/enhanced')
const { sharedConfig } = require('./webpack.shared')

module.exports = {
  entry: path.join(__dirname, 'src/bootstrap-client.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:5510/static/',
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      filename: 'remoteEntry.js',
      ...sharedConfig,
    }),
  ],
}
