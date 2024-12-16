import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  /* 打包导出 */
  // output: 'export',

  /* 将请求代理到后端，开发时使用 */
  async rewrites() { 
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
