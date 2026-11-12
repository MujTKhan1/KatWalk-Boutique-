import { FEATURED, SOCIAL_HANDLE, SOCIAL_TILES } from '../content/site';
import { words } from '../motion/useReveals';

/* ------------------------------------------------------------------ Featured drop */
export function FeaturedDrop() {
  return (
    <section className="section featured" id="featured" aria-labelledby="featured-title" tabIndex={-1}>
      <div className="section-head">
        <p className="eyebrow" data-reveal="fade">
          Featured drop <span className="eyebrow-rule" aria-hidden="true" /> demo pieces
        </p>
        <h2 className="section-title" id="featured-title" data-reveal="lines">
          <span className="line-mask">
            <span className="line">Pieces that</span>
          </span>{' '}
          <span className="line-mask">
            <span className="line">
              <em>start the look.</em>
            </span>
          </span>
        </h2>
        <p className="section-lede" data-reveal="fade">
          Four illustrative pieces showing how a drop could be presented. Not real inventory: names, prices and availability
          will come from the boutique.
        </p>
      </div>
      <ul className="products" data-reveal="stagger">
        {FEATURED.map((p, i) => (
          <li className="product" key={p.id} data-item style={{ ['--i' as string]: i }}>
            <figure>
              <div className="product-media">
                <img src={p.src} alt={p.alt} width={800} height={1000} loading="lazy" decoding="async" />
                <span className="product-tag">Demo piece</span>
              </div>
              <figcaption>
                <span className="product-cat">{p.category}</span>
                <span className="product-name">
                  {p.name} <em>{p.accent}</em>
                </span>
                <span className="product-note">{p.note}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Boutique story */
const STORY =
  'Katwalk is where the street meets the runway. Every piece is chosen to be mixed, layered and made entirely yours, because personal style is the whole point.';

export function Story() {
  return (
    <section className="section story" id="story" aria-labelledby="story-title" tabIndex={-1}>
      <p className="eyebrow" data-reveal="fade">
        The boutique <span className="eyebrow-rule" aria-hidden="true" /> proposed copy
      </p>
      <h2 className="sr-only" id="story-title">
        About Katwalk
      </h2>
      <p className="story-statement" data-reveal="words">
        <span className="sr-only">{STORY}</span>
        <span aria-hidden="true">
          {words(STORY).map(({ w, key }) => (
            <span className="w" key={key}>
              {w}{' '}
            </span>
          ))}
        </span>
      </p>
      <div className="story-grid">
        <figure className="story-media story-media--tall" data-reveal="clip">
          <img src="/media/edit-after-dark.svg" alt="Illustration: a satin slip dress hung in a dark arched niche." loading="lazy" width={800} height={1000} />
        </figure>
        <div className="story-copy" data-reveal="fade">
          <h3>Individual, not uniform.</h3>
          <p>
            A boutique edit means fewer, better pieces: a statement bag, an easy bomber, the dress for later. Styled together,
            they say something about the person wearing them.
          </p>
          <p className="placeholder-note">
            Story copy is a proposal for review. Founding details, location and history to be confirmed with the boutique.
          </p>
        </div>
        <figure className="story-media" data-reveal="clip">
          <img src="/media/product-top-handle.svg" alt="Illustration: a deep rose top-handle bag on a plaster plinth." loading="lazy" width={800} height={1000} />
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Social gallery */
export function SocialGallery() {
  return (
    <section className="section social" id="social" aria-labelledby="social-title">
      <div className="social-head">
        <h2 className="section-title" id="social-title" data-reveal="lines">
          <span className="line-mask">
            <span className="line">From the</span>
          </span>{' '}
          <span className="line-mask">
            <span className="line">
              <em>boutique feed.</em>
            </span>
          </span>
        </h2>
        <p className="social-handle" data-reveal="fade">
          <span>{SOCIAL_HANDLE}</span>
          <span className="placeholder-note">Illustrative tiles. Live feed and link activate once account ownership is confirmed.</span>
        </p>
      </div>
      <ul className="social-grid" data-reveal="stagger">
        {SOCIAL_TILES.map((t, i) => (
          <li key={i} className="social-tile" data-item>
            <img src={t.src} alt={t.alt} style={{ objectPosition: t.pos }} loading="lazy" decoding="async" width={800} height={1000} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Final conversion */
export function Visit() {
  return (
    <section className="section visit" id="visit" aria-labelledby="visit-title" tabIndex={-1}>
      <div className="visit-arch" aria-hidden="true" />
      <p className="eyebrow eyebrow--center" data-reveal="fade">
        Baltimore, Maryland <span className="eyebrow-rule" aria-hidden="true" /> visit
      </p>
      <h2 className="visit-title" id="visit-title" data-reveal="lines">
        <span className="line-mask">
          <span className="line">Find Your</span>
        </span>
        <span className="line-mask">
          <span className="line">
            <em>Next Look.</em>
          </span>
        </span>
      </h2>
      <p className="visit-lede" data-reveal="fade">
        Come in, try it on, and leave with something that feels like you.
      </p>
      <div className="visit-actions" data-reveal="fade">
        <a className="btn btn-primary" href="#lookbook">
          <span className="btn-label">Browse the style edits</span>
        </a>
        <a className="btn btn-link" href="#featured">
          See the featured drop
        </a>
      </div>
      <p className="placeholder-note visit-note" data-reveal="fade">
        Proposed closing section. Address, opening hours and the contact or inquiry route (visit, call, message or appointment)
        are awaiting the boutique's approval, so no form is shown yet.
      </p>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="footer-wordmark">KATWALK</span>
        <span>Your Street. Your Runway.</span>
      </div>
      <nav aria-label="Footer">
        <ul>
          <li>
            <a href="#lookbook">Style edits</a>
          </li>
          <li>
            <a href="#featured">Featured drop</a>
          </li>
          <li>
            <a href="#story">The boutique</a>
          </li>
          <li>
            <a href="#visit">Visit</a>
          </li>
        </ul>
      </nav>
      <p className="footer-note">
        Internal concept demo prepared by Finatra.us for Katwalk Boutique, Baltimore, Maryland. Not an approved production
        website. All imagery and products are illustrative.
      </p>
    </footer>
  );
}

export function PageCurtain() {
  return (
    <div className="page-curtain" aria-hidden="true">
      <span className="page-curtain-label">KATWALK</span>
    </div>
  );
}
