/**
 * Proposed page content. Copy is DEMO copy; photographs are ILLUSTRATIVE stock images
 * (Unsplash License, credits in ASSETS.md), not Katwalk inventory. No prices, stock, SKUs,
 * awards, dates or follower counts.
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
    id: 'tote',
    name: 'Soft Leather',
    accent: 'Tote',
    category: 'Accessories',
    note: 'Supple, roomy and made to carry a whole day.',
    src: '/media/photos/product-tote.webp',
    alt: 'A tan leather tote bag with long handles against a pale wall.',
  },
  {
    id: 'coats',
    name: 'Camel &',
    accent: 'Cream Coats',
    category: 'Outerwear',
    note: 'Soft tailoring to layer over everything.',
    src: '/media/photos/product-coats.webp',
    alt: 'Camel and cream wool coats hanging together on a rail, showing the fabric texture.',
  },
  {
    id: 'satin',
    name: 'Satin',
    accent: 'Cowl Dress',
    category: 'Evening',
    note: 'Liquid sheen for after dark.',
    src: '/media/photos/product-satin.webp',
    alt: 'Close view of a woman in an ivory satin cowl-neck dress with a blue pendant necklace.',
  },
  {
    id: 'denim',
    name: 'Easy',
    accent: 'Denim',
    category: 'Denim',
    note: 'A washed denim jacket, styled your way.',
    src: '/media/photos/product-denim.webp',
    alt: 'A woman in a light blue denim jacket with flowers in her hair, against a bright backdrop.',
  },
];

/** Feed tiles reuse the illustrative photography (nothing scraped from social media). */
export const SOCIAL_TILES = [
  { src: '/media/photos/story-pink-coat.webp', pos: '50% 40%', alt: 'A woman in a pink coat against a pink wall.', title: 'Pink Coat', caption: 'Oversized colour with a city edge' },
  { src: '/media/photos/print-after-dark.webp', pos: '50% 35%', alt: 'Red satin evening dress.', title: 'After Dark', caption: 'Satin, sheen and a little drama' },
  { src: '/media/photos/product-tote.webp', pos: '50% 55%', alt: 'Tan leather tote.', title: 'The Carry', caption: 'Soft leather for every day' },
  { src: '/media/photos/print-street-chic.webp', pos: '50% 30%', alt: 'Camel coat and white jeans street look.', title: 'Street Walk', caption: 'Camel layers and clean whites' },
  { src: '/media/photos/story-boutique-rail.webp', pos: '50% 50%', alt: 'Boutique clothing rails.', title: 'On the Rail', caption: 'New pieces, freshly hung' },
  { src: '/media/photos/print-statement.webp', pos: '50% 45%', alt: 'Long black coat with a red bag.', title: 'Statement', caption: 'Long coat, red bag, no rules' },
];

/** Social handle supplied by the client team; ownership still to be confirmed, so it is not linked. */
export const SOCIAL_HANDLE = '@katwalkboutique';

/** Story images */
export const STORY_IMAGES = {
  tall: { src: '/media/photos/story-pink-coat.webp', alt: 'A woman in an oversized pink coat stands against a pink wall.' },
  small: { src: '/media/photos/story-boutique-rail.webp', alt: 'A boutique interior with neatly spaced clothing rails.' },
};
