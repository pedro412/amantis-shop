/**
 * JSON-LD structured-data helpers and a small `<JsonLd>` component for safe
 * inline injection. Escaping `<` to `<` prevents stray `</script>`
 * sequences inside the payload from breaking out of the script tag.
 */

import { tryImagePublicUrl } from '@/lib/image-url';
import { SITE_URL } from '@/lib/site-url';
import { getWhatsappNumber } from '@/lib/whatsapp';

const SITE_NAME = 'Ámantis';

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: [
      'https://www.instagram.com/a.mantis.lenceria',
      'https://www.facebook.com/profile.php?id=100077885707039',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+${getWhatsappNumber()}`,
        availableLanguage: ['es-MX'],
        areaServed: 'MX',
      },
    ],
  };
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-MX',
  };
}

type BreadcrumbItem = { name: string; path: string };

export function breadcrumbSchema(items: BreadcrumbItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

type ProductSchemaInput = {
  slug: string;
  name: string;
  description: string | null;
  price: string;
  imageKeys: string[];
  category: { name: string };
  inStock: boolean;
};

export function productSchema(p: ProductSchemaInput): Json {
  const url = `${SITE_URL}/producto/${p.slug}`;
  const images = p.imageKeys
    .map((key) => tryImagePublicUrl(key, 'medium'))
    .filter((u): u is string => Boolean(u));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description ?? p.name,
    image: images,
    sku: p.slug,
    category: p.category.name,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'MXN',
      price: p.price,
      availability: p.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}
