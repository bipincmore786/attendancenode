import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async rewrites() {
    return [
      {
        source: '/api/rest_webevent',  // Your frontend will call this
        destination: 'https://dev.aparapi.co.in:8100/sap/bc/rest/rest_webevent?sap-client=400',  // Actual backend
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
