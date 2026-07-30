/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // @sm/scheduling is consumed straight from TypeScript source, with no build
  // step, so Next transpiles it as part of the app.
  transpilePackages: ['@sm/scheduling'],

  webpack: (config) => {
    // The scheduling package writes ESM-correct `./types.js` specifiers, which
    // keep it portable if it is ever consumed by plain Node. Webpack has to be
    // told those map onto the `.ts` sources. Vitest resolves this on its own,
    // which is why the test suite passed before the app could compile.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};
