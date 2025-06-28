import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'http://192.168.45.97:3000', // 당신의 실제 개발 환경 origin
  ],
};

export default nextConfig;
