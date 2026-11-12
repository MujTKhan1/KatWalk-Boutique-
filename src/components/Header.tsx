export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Katwalk Boutique, back to top">
        KATWALK
        <span className="wordmark-note" aria-hidden="true">
          proposed wordmark
        </span>
      </a>
      <nav aria-label="Primary">
        <ul className="nav-list">
          <li>
            <a href="#lookbook">Style edits</a>
          </li>
          <li>
            <a href="#story">The boutique</a>
          </li>
        </ul>
      </nav>
      <a className="nav-explore" href="#visit">
        Visit
      </a>
    </header>
  );
}

export function SkipLink() {
  return (
    <a className="skip-link" href="#lookbook">
      Skip the intro animation
    </a>
  );
}
