/**
 * next.config.js
 *
 * This configuration customizes the webpack configuration to exclude supabase from the client-side bundle.
 * When building for the client (i.e. isServer is false), we set an alias to false for '@supabase/supabase-js'.
 * This way, supabase will not be bundled into the client code, reducing bundle size if it's not needed on the client.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude supabase by replacing the module with an empty module on client-side builds
      config.resolve.alias['@supabase/supabase-js'] = false;
    }
    return config;
  },
};

module.exports = nextConfig; 