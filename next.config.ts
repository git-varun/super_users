import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'static-assets-web.flixcart.com' },
      { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
      { protocol: 'https', hostname: 'myntra.com' },
      { protocol: 'https', hostname: 'www.myntra.com' },
      { protocol: 'https', hostname: 'search.myntracdn.com' },
      { protocol: 'https', hostname: 'static.fitz.myntracdn.com' },
      { protocol: 'https', hostname: 'adn-static1.nykaa.com' },
      { protocol: 'https', hostname: 'image.uniqlo.com' },
      { protocol: 'https', hostname: 'lp2.hm.com' },
      { protocol: 'https', hostname: 'assets.adidas.com' },
      { protocol: 'https', hostname: 'images.puma.com' },
      { protocol: 'https', hostname: 'cdn.grofers.com' },
      { protocol: 'https', hostname: 'cdn.zeptonow.com' },
      { protocol: 'https', hostname: 'm.media-tunnel.com' },
      { protocol: 'https', hostname: 'instamart-media-assets.swiggy.com' },
      { protocol: 'https', hostname: 'blinkit.com' },
    ],
  },
};

export default nextConfig;
