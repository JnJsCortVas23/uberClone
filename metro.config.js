const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Esto obliga a Metro a ignorar los cambios en las carpetas temporales de compilación de Android
    blockList: [
      /.*\/android\/\.cxx\/.*/,
      /.*\/android\/build\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);