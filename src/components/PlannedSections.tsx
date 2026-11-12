/**
 * Minimal, honest destinations for the hero CTAs while the remaining sections are
 * designed. Nothing here pretends to sell, book or submit anything.
 */
export function PlannedSections() {
  return (
    <>
      <section className="planned planned--story" id="story" aria-labelledby="story-title" tabIndex={-1}>
        <p className="eyebrow">
          The boutique <span className="eyebrow-rule" aria-hidden="true" /> proposed copy
        </p>
        <h2 id="story-title" className="planned-title">
          Style that starts <em>with you.</em>
        </h2>
        <div className="planned-body">
          <p>
            Katwalk is a boutique built around personal style: pieces chosen to be mixed, layered and made your own. Come for a
            statement piece, leave with a whole look.
          </p>
          <p className="placeholder-note">Story copy is a proposal for review. Founding details, location and history to be confirmed with the boutique.</p>
        </div>
      </section>

      <section className="planned planned--roadmap" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="roadmap-title">
          Next in this prototype
        </h2>
        <ol className="roadmap">
          <li>
            <span>Featured drop</span> three or four clearly labelled demo products. No prices or stock until approved.
          </li>
          <li>
            <span>Social gallery</span> approved imagery only. Links go live once account ownership is confirmed.
          </li>
          <li>
            <span>Full style edits</span> Street Chic, Statement Pieces and After-Dark Looks, each with its own edit.
          </li>
        </ol>
      </section>

      <section className="planned planned--visit" id="visit" aria-labelledby="visit-title" tabIndex={-1}>
        <h2 id="visit-title" className="visit-title">
          Find Your <em>Next Look.</em>
        </h2>
        <p className="placeholder-note">
          Proposed closing headline. The contact or inquiry route (visit, call, message or appointment) is awaiting the boutique's
          approval, so no form is shown yet.
        </p>
      </section>

      <footer className="site-footer">
        <p>Katwalk Boutique · Baltimore, Maryland</p>
        <p>Internal concept demo prepared by Finatra.us. Not an approved production website. All imagery is illustrative.</p>
      </footer>
    </>
  );
}
