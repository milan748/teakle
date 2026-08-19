'use client';

export default function AccountError({ error, reset }) {
  return (
    <>
      <style>{`
        .acct-err {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          background: var(--bg-primary);
        }
        .acct-err-box { text-align: center; max-width: 480px; }
        .acct-err-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto var(--space-md);
          color: var(--bronze);
          opacity: 0.35;
        }
        .acct-err-title {
          font-family: var(--font-display);
          font-size: var(--text-h3);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }
        .acct-err-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          line-height: var(--lh-relaxed);
        }
        .acct-err-btn {
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
        .acct-err-btn:hover { background: var(--forest); }
      `}</style>

      <section className="acct-err">
        <div className="acct-err-box">
          <svg className="acct-err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h1 className="acct-err-title">Account Error</h1>
          <p className="acct-err-desc">
            Something went wrong with your account. Please try again.
          </p>
          <button className="acct-err-btn" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      </section>
    </>
  );
}
