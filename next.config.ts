import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [
      // Stranice artikala su preseljene pod /proizvodi — stari linkovi i dalje rade.
      {
        source: "/artikli/:code",
        destination: "/proizvodi/artikli/:code",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
