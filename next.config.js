const withNextIntl = require("next-intl/plugin")("./app/i18n.ts");

module.exports = withNextIntl({
  reactStrictMode: false,
});
