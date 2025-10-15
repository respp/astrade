const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .wasm files
config.resolver.assetExts.push('wasm');

// Add support for .wasm files in source extensions
config.resolver.sourceExts.push('wasm');

// Configure WebAssembly support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver for @dojoengine packages
config.resolver.alias = {
  ...config.resolver.alias,
  '@dojoengine/torii-wasm': '@dojoengine/torii-wasm/pkg/web',
};

module.exports = config;
