/**
 * Lookbook content. Images are ILLUSTRATIVE stock photography (Unsplash License, credits in
 * ASSETS.md), not Katwalk inventory or models.
 * Swap `src` for approved photography (same 4:5 aspect) and the WebGL panels and
 * HTML cards update together.
 */
export type LookbookEdit = {
  id: string;
  index: string;
  title: string;
  /** italic serif accent word in the title */
  accent: string;
  blurb: string;
  src: string;
  alt: string;
};

/** width / height, shared by WebGL planes and HTML cards */
export const PANEL_ASPECT = 4 / 5;

export const LOOKBOOK: LookbookEdit[] = [
  {
    id: 'street-chic',
    index: '01',
    title: 'Street',
    accent: 'Chic',
    blurb: 'Camel layers, clean whites, everyday confidence.',
    src: '/media/photos/print-street-chic.webp',
    alt: 'A woman in a camel coat, white top and white jeans walks confidently down a city street.',
  },
  {
    id: 'statement-pieces',
    index: '02',
    title: 'Statement',
    accent: 'Pieces',
    blurb: 'One bold piece to build the whole look around.',
    src: '/media/photos/print-statement.webp',
    alt: 'A woman in a long black coat carries a red handbag through a stone colonnade.',
  },
  {
    id: 'after-dark',
    index: '03',
    title: 'After-Dark',
    accent: 'Looks',
    blurb: 'Satin, sheen and soft drama for the evening.',
    src: '/media/photos/print-after-dark.webp',
    alt: 'A woman in a red satin evening dress poses in a softly lit bar.',
  },
];

export const HERO_STILL = '/media/hero-still.webp';
