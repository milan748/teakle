'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          .ge-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F7F4EE;
            padding: 2rem;
            font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
          .ge-inner { text-align: center; max-width: 480px; }
          .ge-title {
            font-size: 1.805rem;
            font-weight: 500;
            color: #2B221B;
            margin: 0 0 1rem;
          }
          .ge-desc {
            font-size: 0.8075rem;
            color: #61574F;
            margin: 0 0 2rem;
            line-height: 1.65;
          }
          .ge-btn {
            display: inline-block;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.6175rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #F7F4EE;
            background: #33261D;
            border: 1px solid #33261D;
            padding: 0.75rem 1.75rem;
            cursor: pointer;
          }
          .ge-btn:hover { background: #1D3528; }
          .ge-btn:focus-visible { outline: 2px solid #A78659; outline-offset: 3px; }
        `}</style>
        <div className="ge-page">
          <div className="ge-inner">
            <h1 className="ge-title">Something went wrong</h1>
            <p className="ge-desc">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button className="ge-btn" onClick={() => reset()}>
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
