const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for better dependency resolution
config.resolver.alias = {
  ...config.resolver.alias,
  '@react-native-masked-view/masked-view': require.resolve('@react-native-masked-view/masked-view'),
};

// Ensure proper resolution of React Native dependencies
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
