import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about', '/audio', '/blog', '/prophecies', '/testimonies', '/partnership/landing'].map(
    (path) => ({ url: `https://prophetnamara.org${path}` })
  );
}
