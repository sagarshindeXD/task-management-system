const { addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = function override(config) {
  config = addWebpackAlias({
    '@config': path.resolve(__dirname, 'src/config'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@components': path.resolve(__dirname, 'src/components')
  })(config);

  return config;
};
