module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-module-resolver',
      [
        'babel-plugin-module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@dojoengine/torii-wasm': '@dojoengine/torii-wasm/pkg/web',
          },
        },
      ],
    ],
  };
};