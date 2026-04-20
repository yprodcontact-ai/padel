import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
  customWorkerDir: "worker",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your next config here
};

export default withPWA(nextConfig);
