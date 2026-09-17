const path = require('path')
const { UniversalFederationPlugin } = require('@module-federation/node')
const { FEDERATION_NAME, sharedConfig } = require('./webpack.shared')

/** Ensures globalThis[federationName] is set for Node + browser loaders. */
class ServerRemoteEntryGlobalPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('ServerRemoteEntryGlobalPlugin', (compilation, callback) => {
      const asset = compilation.assets['remoteEntry.js']
      if (!asset) {
        callback()
        return
      }
      let source = asset.source()
      if (typeof source !== 'string' || source.includes(`globalThis["${FEDERATION_NAME}"]`)) {
        callback()
        return
      }
      if (source.includes('module.exports=__webpack_exports__')) {
        source = source.replace(
          'module.exports=__webpack_exports__',
          `module.exports=__webpack_exports__;globalThis["${FEDERATION_NAME}"]=module.exports`,
        )
      }
      compilation.updateAsset('remoteEntry.js', {
        source: () => source,
        size: () => source.length,
      })
      callback()
    })
  }
}

module.exports = {
  entry: path.join(__dirname, 'src/bootstrap-server.js'),
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist/server'),
    publicPath: 'http://localhost:5510/static/server/',
    library: { type: 'commonjs-module' },
    clean: true,
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
    new UniversalFederationPlugin({
      isServer: true,
      filename: 'remoteEntry.js',
      library: { type: 'commonjs-module' },
      ...sharedConfig,
      shared: {
        ...sharedConfig.shared,
        'react-dom/server': {
          singleton: true,
          requiredVersion: sharedConfig.shared['react-dom'].requiredVersion,
          eager: true,
        },
      },
    }),
    new ServerRemoteEntryGlobalPlugin(),
  ],
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'react-dom/server': 'commonjs react-dom/server',
  },
}
