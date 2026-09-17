const path = require('path')
const { ModuleFederationPlugin } = require('@module-federation/enhanced')

const PORT = Number(process.env.EXAMPLE_MFE_DEV_PORT || 5510)
const base = `http://localhost:${PORT}/static`

function clientConfig(name, exposePath, entryFile) {
  return {
    name,
    entry: path.join(__dirname, entryFile),
    output: {
      path: path.join(__dirname, 'dist/static', name),
      publicPath: `${base}/${name}/`,
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
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        exposes: { './App': exposePath },
        shared: {
          react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
        },
      }),
    ],
  }
}

module.exports = [
  clientConfig('example_mfe', './src/minimal/App.jsx', 'src/minimal/bootstrap-client.js'),
  clientConfig(
    'complex_demo_mfe',
    './src/complex/App.jsx',
    'src/complex/bootstrap-client.js',
  ),
]
