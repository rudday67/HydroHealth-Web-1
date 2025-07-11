/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "({ isDisabled: true })",
        "process.env.INSTAGRAM_KEY": JSON.stringify(process.env.INSTAGRAM_KEY),
      }),
    ];
    return config;
  },
  images: {
    domains: [
      "hydrohealth.smartgreenovation.com",
      "hydrohealth.dev.smartgreenovation.com",
      "lh3.googleusercontent.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hydrohealth.smartgreenovation.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "hydrohealth.dev.smartgreenovation.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/upload/classify',
        destination: 'http://hydrohealth.dev.smartgreenovation.com/upload/classify',
      },
    ];
  },
};

export default nextConfig;
