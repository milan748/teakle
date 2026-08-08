export const metadata = {
  title: 'Archive',
  description: 'Past collections from Teakle. A record of objects made, editions released, and craft explored.',
  openGraph: { title: 'Archive — Teakle', description: 'Past collections from Teakle.' },
};

export default function ArchivePage() {
  return (
    <>
      <style>{`
        .past-collection {
          background: var(--bg-primary);
          padding: var(--space-xl) 0 var(--space-2xl);
        }
        .past-collection .container {
          max-width: 1100px;
        }

        .edition-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2xl);
          align-items: center;
          padding: var(--space-2xl) 0;
          border-bottom: var(--border-hair);
        }
        .edition-card:first-child {
          padding-top: 0;
        }

        .edition-image {
          aspect-ratio: 4 / 5;
          background: var(--stone);
          overflow: hidden;
        }
        .edition-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s var(--ease);
        }
        .edition-card:hover .edition-image img {
          transform: scale(1.04);
        }

        .edition-content {}
        .edition-number {
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bronze);
          margin-bottom: var(--space-sm);
        }
        .edition-title {
          font-size: clamp(1.5rem, 2.8vw, var(--text-h2));
          margin-bottom: var(--space-xs);
          max-width: none;
        }
        .edition-desc {
          color: var(--text-secondary);
          font-size: var(--text-body);
          margin-bottom: var(--space-md);
          max-width: 42ch;
          line-height: var(--lh-relaxed);
        }

        .sold-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) 0;
          border-top: var(--border-hair);
          border-bottom: var(--border-hair);
          margin-bottom: var(--space-md);
        }
        .buyer-avatar {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          overflow: hidden;
          background: var(--stone);
          flex-shrink: 0;
        }
        .buyer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .buyer-info {
          flex: 1;
        }
        .buyer-info .sold-label {
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 0.1rem;
        }
        .buyer-info .buyer-name {
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
        }
        .sold-date {
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          text-align: right;
          flex-shrink: 0;
        }

        .edition-actions {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }
        .watch-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-primary);
          border-bottom: 1px solid var(--stone);
          padding-bottom: 2px;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }
        .watch-link:hover {
          color: var(--bronze);
          border-color: var(--bronze);
        }
        .sold-badge {
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--stone);
          border: 1px solid var(--stone);
          padding: 0.35em 1em;
        }

        .edition-card.reversed {
          direction: rtl;
        }
        .edition-card.reversed > * {
          direction: ltr;
        }

        @media (max-width: 860px) {
          .edition-card,
          .edition-card.reversed {
            grid-template-columns: 1fr;
            gap: var(--space-md);
            direction: ltr;
          }
          .edition-image { aspect-ratio: 4/5; }
          .edition-content { padding: var(--space-sm) 0; }
          .edition-number { font-size: var(--text-caption); }
          .edition-title { font-size: var(--text-subhead); }
          .edition-desc { font-size: var(--text-body); }
          .buyer-avatar { width: 48px; height: 48px; }
          .sold-label { font-size: var(--text-caption); }
          .buyer-name { font-size: var(--text-body); }
          .sold-date { font-size: var(--text-caption); }
          .watch-link { font-size: var(--text-caption); }
          .sold-badge { font-size: var(--text-caption); }
          .archive-editions { gap: var(--space-xl); }
        }

        @media (max-width: 560px) {
          .archive-editions { gap: var(--space-lg); }
          .edition-image { aspect-ratio: 3/4; }
          .edition-content { padding: var(--space-xs) 0; }
          .edition-number { font-size: var(--text-caption); }
          .edition-title { font-size: var(--text-subhead); }
          .edition-desc { font-size: var(--text-body); }
          .sold-info { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
          .sold-date { text-align: left; }
          .buyer-avatar { width: 44px; height: 44px; }
          .edition-actions { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
        }
        @media (max-width: 430px) {
          .edition-title { font-size: var(--text-subhead); }
          .edition-desc { font-size: var(--text-caption); }
        }
      `}</style>

      <section className="page-hero">
        <img src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A sculptural wooden centrepiece on a plain floor." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Archive</span>
          <h1>Editions that found their homes.</h1>
          <p>Each season, one centrepiece — carved from a single reclaimed timber block. Once sold, it&apos;s never restocked. Here are the editions that came before.</p>
        </div>
      </section>

      <section className="past-collection">
        <div className="container">

          <article className="edition-card reveal">
            <div className="edition-image">
              <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Piece N° 04 — The Hollow Bench" />
            </div>
            <div className="edition-content">
              <span className="edition-number">Piece N° 04</span>
              <h2 className="edition-title">The Hollow Bench</h2>
              <p className="edition-desc">A three-seat bench with visible hand-cut joinery, built from a single timber block. The seat is left slightly rough to age naturally with use.</p>
              <div className="sold-info">
                <div className="buyer-avatar">
                  <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Vikram Desai" />
                </div>
                <div className="buyer-info">
                  <span className="sold-label">Bought by</span>
                  <span className="buyer-name">Vikram Desai</span>
                </div>
                <span className="sold-date">Mar 2026</span>
              </div>
              <div className="edition-actions">
                <a href="/studio" className="watch-link">Watch the Process →</a>
                <span className="sold-badge">Sold</span>
              </div>
            </div>
          </article>

          <article className="edition-card reversed reveal">
            <div className="edition-image">
              <img loading="lazy" src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Piece N° 03 — The Still Stool" />
            </div>
            <div className="edition-content">
              <span className="edition-number">Piece N° 03</span>
              <h2 className="edition-title">The Still Stool</h2>
              <p className="edition-desc">A low-form stool carved from a single reclaimed teak block. The seat curves gently inward, following the natural grain direction of the timber.</p>
              <div className="sold-info">
                <div className="buyer-avatar">
                  <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Riya Sharma" />
                </div>
                <div className="buyer-info">
                  <span className="sold-label">Bought by</span>
                  <span className="buyer-name">Riya Sharma</span>
                </div>
                <span className="sold-date">Jan 2026</span>
              </div>
              <div className="edition-actions">
                <a href="/studio" className="watch-link">Watch the Process →</a>
                <span className="sold-badge">Sold</span>
              </div>
            </div>
          </article>

          <article className="edition-card reveal">
            <div className="edition-image">
              <img loading="lazy" src="https://images.pexels.com/photos/8251295/pexels-photo-8251295.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Piece N° 02 — The Anchor Round" />
            </div>
            <div className="edition-content">
              <span className="edition-number">Piece N° 02</span>
              <h2 className="edition-title">The Anchor Round</h2>
              <p className="edition-desc">A circular dining table cut from a single wide teak plank, with hand-shaped legs joined without metal fasteners. The surface darkens with age.</p>
              <div className="sold-info">
                <div className="buyer-avatar">
                  <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Arjun Mehta" />
                </div>
                <div className="buyer-info">
                  <span className="sold-label">Bought by</span>
                  <span className="buyer-name">Arjun Mehta</span>
                </div>
                <span className="sold-date">Sep 2025</span>
              </div>
              <div className="edition-actions">
                <a href="/studio" className="watch-link">Watch the Process →</a>
                <span className="sold-badge">Sold</span>
              </div>
            </div>
          </article>

          <article className="edition-card reversed reveal">
            <div className="edition-image">
              <img loading="lazy" src="https://images.pexels.com/photos/6962757/pexels-photo-6962757.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Piece N° 01 — The Grain Bowl" />
            </div>
            <div className="edition-content">
              <span className="edition-number">Piece N° 01</span>
              <h2 className="edition-title">The Grain Bowl</h2>
              <p className="edition-desc">A sculptural bowl carved from a single block of aged rosewood. The walls thin towards the rim, revealing the grain pattern in cross-section.</p>
              <div className="sold-info">
                <div className="buyer-avatar">
                  <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Priya Nair" />
                </div>
                <div className="buyer-info">
                  <span className="sold-label">Bought by</span>
                  <span className="buyer-name">Priya Nair</span>
                </div>
                <span className="sold-date">May 2025</span>
              </div>
              <div className="edition-actions">
                <a href="/studio" className="watch-link">Watch the Process →</a>
                <span className="sold-badge">Sold</span>
              </div>
            </div>
          </article>

        </div>
      </section>
    </>
  )
}
