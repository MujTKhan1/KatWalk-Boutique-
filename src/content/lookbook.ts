/**
 * Lookbook content. Every image here is an ORIGINAL ILLUSTRATIVE PLACEHOLDER
 * (vector artwork created for this demo, see ASSETS.md), not Katwalk inventory.
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
    blurb: 'Oversized layers, easy denim, everyday shine.',
    src: '/media/edit-street-chic.svg',
    alt: 'Illustration: an oversized blush bomber jacket on a hanger in front of a pale archway.',
  },
  {
    id: 'statement-pieces',
    index: '02',
    title: 'Statement',
    accent: 'Pieces',
    blurb: 'One bold piece to build the whole look around.',
    src: '/media/edit-statement-pieces.svg',
    alt: 'Illustration: a silver handbag on a blush plinth against a coral sun.',
  },
  {
    id: 'after-dark',
    index: '03',
    title: 'After-Dark',
    accent: 'Looks',
    blurb: 'Satin, sheen and soft drama for the evening.',
    src: '/media/edit-after-dark.svg',
    alt: 'Illustration: a blush satin slip dress on a hanger, lit against a dark archway.',
  },
];

export const HERO_STILL = '/media/hero-still.webp';
