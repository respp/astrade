const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add support for .wasm files
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
  });

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
    url: false,
    querystring: false,
    os: false,
    net: false,
    tls: false,
    child_process: false,
  };

  // Add alias for @dojoengine packages
  config.resolve.alias = {
    ...config.resolve.alias,
    '@dojoengine/torii-wasm': '@dojoengine/torii-wasm/pkg/web',
  };

  return config;
};
