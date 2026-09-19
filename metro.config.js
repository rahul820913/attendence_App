const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Intercept the broken Supabase internal path strings 
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes('./phoenix/presenceAdapter')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@supabase/realtime-js/dist/main/phoenix/presenceAdapter.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
