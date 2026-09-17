const deps = require('./package.json').dependencies

const FEDERATION_NAME = 'complex_demo_mfe'

const sharedConfig = {
  name: FEDERATION_NAME,
  exposes: {
    './App': './src/App.jsx',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: deps.react,
      eager: true,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: deps['react-dom'],
      eager: true,
    },
  },
}

module.exports = { FEDERATION_NAME, sharedConfig }
