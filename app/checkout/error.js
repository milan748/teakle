'use client';

export default function CheckoutError({ error, reset }) {
  return (
    <>
      <style>{`
        .co-err {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          background: var(--bg-primary);
        }
        .co-err-box { text-align: center; max-width: 480px; }
        .co-err-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto var(--space-md);
          color: var(--bronze);
          opacity: 0.35;
        }
        .co-err-title {
          font-family: var(--font-display);
          font-size: var(--text-h3);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }
        .co-err-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          line-height: var(--lh-relaxed);
        }
        .co-err-btn {
          display: inline-block;
          font-family: var(--font-body);
          font-size: var(--text-label);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          padding: 0.75rem 1.75rem;
          cursor: pointer;
          transition: background 200ms var(--ease);
        }
        .co-err-btn:hover { background: var(--forest); }
      `}</style>

      <section className="co-err">
        <div className="co-err-box">
          <svg className="co-err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h1 className="co-err-title">Checkout Error</h1>
          <p className="co-err-desc">
            Something went wrong during checkout. Please try again — your cart is safe.
          </p>
          <button className="co-err-btn" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      </section>
    </>
  );
}
