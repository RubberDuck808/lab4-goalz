const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  blockList: [
    // nativewind 4.2.x bundles its own react and react-native (0.85.x).
    // Block them so Metro resolves these from the project root only,
    // preventing duplicate-React hook errors.
    new RegExp(
      `${__dirname.replace(/\\/g, '\\\\')}\\\\node_modules\\\\nativewind\\\\node_modules\\\\(react|react-native)\\\\.*`
    ),
  ],
};

module.exports = withNativeWind(config, { input: './global.css' });
