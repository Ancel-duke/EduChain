const webpack = require('webpack');

// Custom plugin to filter warnings
class SuppressWarningsPlugin {
  apply(compiler) {
    const warningPatterns = [
      /Can't resolve '@base-org\/account'/,
      /Can't resolve '@coinbase\/wallet-sdk'/,
      /Can't resolve '@gemini-wallet\/core'/,
      /Can't resolve '@metamask\/sdk'/,
      /Can't resolve 'porto'/,
      /Can't resolve '@safe-global\/safe-apps-sdk'/,
      /Can't resolve '@safe-global\/safe-apps-provider'/,
      /Can't resolve '@walletconnect\/ethereum-provider'/,
      /Can't resolve '@react-native-async-storage\/async-storage'/,
      /@wagmi\/connectors/,
      /@metamask\/sdk/,
    ];

    compiler.hooks.afterCompile.tap('SuppressWarningsPlugin', (compilation) => {
      compilation.warnings = compilation.warnings.filter((warning) => {
        const warningMessage = warning.message || warning.toString();
        return !warningPatterns.some(pattern => pattern.test(warningMessage));
      });
    });

    compiler.hooks.done.tap('SuppressWarningsPlugin', (stats) => {
      if (stats.compilation) {
        stats.compilation.warnings = stats.compilation.warnings.filter((warning) => {
          const warningMessage = warning.message || warning.toString();
          return !warningPatterns.some(pattern => pattern.test(warningMessage));
        });
      }
    });
  }
}

module.exports = function override(config, env) {
  // Suppress warnings for optional wallet connector dependencies
  // These are optional peer dependencies that wagmi/rainbowkit try to load
  // but aren't required for basic functionality (MetaMask works without them)
  
  // Add webpack alias to stub out React Native modules (used by @metamask/sdk in web environment)
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  
  // Stub out React Native async storage (not needed in web environment)
  // Setting to false tells webpack to ignore this module
  config.resolve.alias['@react-native-async-storage/async-storage'] = false;
  
  // Also add fallback to prevent webpack from trying to resolve it
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback['@react-native-async-storage/async-storage'] = false;
  
  // Use IgnorePlugin to completely ignore the React Native module
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^@react-native-async-storage\/async-storage$/,
    })
  );

  // Configure webpack to ignore module resolution warnings
  config.ignoreWarnings = [
    // Ignore all warnings from @wagmi/connectors module
    { 
      module: /node_modules\/@wagmi\/connectors/
    },
    // Ignore all warnings from @metamask/sdk (React Native dependencies in web environment)
    { 
      module: /node_modules\/@metamask\/sdk/
    },
    // Ignore specific module resolution warnings using regex patterns
    /Can't resolve '@base-org\/account'/,
    /Can't resolve '@coinbase\/wallet-sdk'/,
    /Can't resolve '@gemini-wallet\/core'/,
    /Can't resolve '@metamask\/sdk'/,
    /Can't resolve 'porto'/,
    /Can't resolve '@safe-global\/safe-apps-sdk'/,
    /Can't resolve '@safe-global\/safe-apps-provider'/,
    /Can't resolve '@walletconnect\/ethereum-provider'/,
    /Can't resolve '@react-native-async-storage\/async-storage'/,
  ];

  // Add custom plugin to filter warnings
  config.plugins.push(new SuppressWarningsPlugin());

  return config;
};
