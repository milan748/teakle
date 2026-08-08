export default function Loading() {
  return (
    <>
      <style>{`
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
        }
        .loading-spinner {
          width: 28px;
          height: 28px;
          border: 2px solid var(--stone);
          border-top-color: var(--bronze);
          border-radius: 50%;
          animation: loadSpin 700ms linear infinite;
        }
        @keyframes loadSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner { animation: none; border-top-color: var(--stone); }
        }
      `}</style>
      <div className="loading-page" role="status" aria-label="Loading">
        <div className="loading-spinner"></div>
      </div>
    </>
  );
}
