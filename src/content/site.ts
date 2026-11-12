/**
 * Proposed page content. Everything here is DEMO copy and ILLUSTRATIVE artwork pending the
 * boutique's approval: no prices, stock, SKUs, awards, dates or follower counts.
 */
export type DemoProduct = {
  id: string;
  name: string;
  accent: string;
  category: string;
  note: string;
  src: string;
  alt: string;
};

export const FEATURED: DemoProduct[] = [
  {
    id: 'top-handle',
    name: 'The Arch',
    accent: 'Top-Handle',
    category: 'Accessories',
    note: 'Structured, polished, made to carry a whole look.',
    src: '/media/product-top-handle.svg',
    alt: 'Illustration of a deep rose structured top-handle bag with gold hardware on a plaster plinth.',
  },
  {
    id: 'bomber',
    name: 'Blush',
    accent: 'Bomber',
    category: 'Outerwear',
    note: 'Oversized and soft, easy over everything.',
    src: '/media/product-bomber.svg',
    alt: 'Illustration of an oversized blush bomber jacket on a hanger in a pale arched niche.',
  },
  {
    id: 'slip-dress',
    name: 'Satin',
    accent: 'Slip Dress',
    category: 'Evening',
    note: 'Bias-cut sheen for after dark.',
    src: '/media/product-slip-dress.svg',
    alt: 'Illustration of a blush satin slip dress on a hanger against a dark backdrop.',
  },
  {
    id: 'denim',
    name: 'Wide-Leg',
    accent: 'Denim',
    category: 'Denim',
    note: 'A relaxed line that grounds statement pieces.',
    src: '/media/product-denim.svg',
    alt: 'Illustration of wide-leg indigo jeans with contrast stitching in a pale arched niche.',
  },
];

/** Illustrative feed tiles (local artwork, never scraped). */
export const SOCIAL_TILES = [
  { src: '/media/product-top-handle.svg', pos: '50% 62%', alt: 'Illustration: rose top-handle bag detail.' },
  { src: '/media/edit-after-dark.svg', pos: '50% 45%', alt: 'Illustration: satin slip dress against a dark arch.' },
  { src: '/media/product-denim.svg', pos: '50% 40%', alt: 'Illustration: wide-leg denim.' },
  { src: '/media/edit-street-chic.svg', pos: '50% 48%', alt: 'Illustration: blush bomber on a hanger.' },
  { src: '/media/edit-statement-pieces.svg', pos: '50% 60%', alt: 'Illustration: rose bag on a blush plinth.' },
  { src: '/media/product-slip-dress.svg', pos: '50% 50%', alt: 'Illustration: satin slip dress detail.' },
];

/** Social handle supplied by the client team; ownership still to be confirmed, so it is not linked. */
export const SOCIAL_HANDLE = '@katwalkboutique';
