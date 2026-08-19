import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
};

export default function ShopNotFound() {
  return (
    <>
      <style>{`
        .nf-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: var(--space-lg);
        }
        .nf-inner {
          text-align: center;
          max-width: 480px;
        }
        .nf-code {
          font-family: var(--font-display);
          font-size: clamp(4rem, 10vw, 8rem);
          font-weight: 300;
          color: var(--stone);
          line-height: 1;
          margin-bottom: var(--space-sm);
          opacity: 0.4;
        }
        .nf-divider {
          width: 40px;
          height: 1px;
          background: var(--bronze);
          margin: 0 auto var(--space-md);
          opacity: 0.5;
        }
        .nf-title {
          font-family: var(--font-display);
          font-size: var(--text-h2);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }
        .nf-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          line-height: var(--lh-relaxed);
        }
        .nf-links {
          display: flex;
          gap: var(--space-sm);
          justify-content: center;
          flex-wrap: wrap;
        }
        .nf-link {
          display: inline-block;
          font-family: var(--font-body);
          font-size: var(--text-label);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all var(--dur-fast) var(--ease);
          padding: 0.75rem 1.75rem;
        }
        .nf-link-primary {
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
        }
        .nf-link-primary:hover { background: var(--forest); border-color: var(--forest); }
        .nf-link-secondary {
          color: var(--text-secondary);
          border: 1px solid var(--stone);
          background: transparent;
        }
        .nf-link-secondary:hover { color: var(--text-primary); border-color: var(--text-primary); }
        .nf-link:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
      `}</style>

      <section className="nf-page">
        <div className="nf-inner">
          <div className="nf-code" aria-hidden="true">404</div>
          <div className="nf-divider"></div>
          <h1 className="nf-title">Product Not Found</h1>
          <p className="nf-desc">
            The piece you are looking for may have been moved or no longer exists.
          </p>
          <div className="nf-links">
            <Link href="/" className="nf-link nf-link-primary">Back to Home</Link>
            <Link href="/gallery" className="nf-link nf-link-secondary">Browse Collection</Link>
          </div>
        </div>
      </section>
    </>
  );
}
