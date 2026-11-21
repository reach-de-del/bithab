// Wraps app.json so the web build can be served from a sub-path (GitHub Pages: https://USER.github.io/REPO/).
// Set EXPO_BASE_URL=/REPO when building; leave it unset for local dev and native builds.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...(config.experiments ?? {}),
    baseUrl: process.env.EXPO_BASE_URL ?? '',
  },
});
