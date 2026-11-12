import { LOOKBOOK } from '../content/lookbook';
import { store } from '../motion/store';

type Props = {
  /** immersive: rendered inside the pinned stage and animated by the sequence timeline */
  immersive: boolean;
};

/**
 * The lookbook preview. In the immersive sequence the WebGL panels land exactly on
 * `.card-media` before these HTML images fade in on top, so photos never jump.
 * Card media must not be transformed by animation (the GL panels measure its rect).
 */
export function LookbookPreview({ immersive }: Props) {
  return (
    <div className={immersive ? 'lookbook lookbook--stage' : 'lookbook'} data-anim="lookbook-layer">
      <div className="lookbook-head">
        <p className="eyebrow" data-anim="lb-meta">
          Style edits <span className="eyebrow-rule" aria-hidden="true" /> 01 to 03
        </p>
        <h2 className="lookbook-title" id="lookbook-title">
          <span className="line-mask">
            <span className="line" data-anim="lb-line">
              The runway becomes
            </span>
          </span>
          <span className="line-mask">
            <span className="line" data-anim="lb-line">
              <em>the collection.</em>
            </span>
          </span>
        </h2>
      </div>
      <ul className="cards" aria-labelledby="lookbook-title">
        {LOOKBOOK.map((e, i) => (
          <li className="card" key={e.id}>
            <figure>
              <div
                className="card-media"
                data-anim="card-media"
                ref={(el) => {
                  if (immersive) store.cardEls[i] = el;
                }}
              >
                <img src={e.src} alt={e.alt} width={800} height={1000} decoding="async" loading={immersive ? 'eager' : 'lazy'} />
              </div>
              <figcaption className="card-caption" data-anim="card-caption">
                <span className="card-index">{e.index}</span>
                <span className="card-title">
                  {e.title} <em>{e.accent}</em>
                </span>
                <span className="card-blurb">{e.blurb}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="illustrative-note" data-anim="lb-meta">
        Illustrative stock photography (Unsplash). Categories and imagery pending the boutique's approval.
      </p>
    </div>
  );
}
