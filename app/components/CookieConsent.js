'use client';

import { useState, useEffect, useCallback } from 'react';

function readStored() {
  try {
    if (typeof window !== 'undefined' && window.Teakle && window.Teakle.getConsent) {
      return window.Teakle.getConsent();
    }
    const raw = localStorage.getItem('teakle_consent');
    const c = raw ? JSON.parse(raw) : null;
    return c && typeof c.analytics === 'boolean' ? c : null;
  } catch {
    return null;
  }
}

function persist(analytics) {
  try {
    if (window.Teakle && window.Teakle.setConsent) window.Teakle.setConsent(analytics);
    else localStorage.setItem('teakle_consent', JSON.stringify({ necessary: true, analytics: !!analytics, ts: Date.now() }));
  } catch {}
}

function storedAnalytics() {
  const stored = readStored();
  return !!(stored && stored.analytics);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState('banner');
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!readStored()) setVisible(true);
    function reopen() {
      setAnalytics(storedAnalytics());
      setView('prefs');
      setVisible(true);
    }
    window.addEventListener('teakle-open-cookie-prefs', reopen);
    return () => window.removeEventListener('teakle-open-cookie-prefs', reopen);
  }, []);

  /* Dismiss without saving: stored preferences are never touched.
     Returns to the banner notice (the pre-panel state). */
  const dismiss = useCallback(() => {
    setAnalytics(storedAnalytics());
    setView('banner');
    setVisible(true);
  }, []);

  const choose = useCallback((value) => {
    persist(value);
    setView('banner');
    setVisible(false);
  }, []);

  /* Scroll locks only while the full preferences panel is open. */
  useEffect(() => {
    if (!visible || view !== 'prefs') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(e) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, view, dismiss]);

  if (!visible) return null;
  const prefsOpen = view === 'prefs';

  return (
    <>
      {prefsOpen && (
        <div
          className="cookie-overlay"
          onClick={dismiss}
          aria-hidden="true"
        ></div>
      )}
      <div
        className="cookie-banner"
        role="dialog"
        aria-modal={prefsOpen ? 'true' : 'false'}
        aria-label={prefsOpen ? 'Cookie preferences' : 'Cookie notice'}
      >
        {prefsOpen ? (
          <>
            <div className="cookie-prefs-head">
              <span className="cookie-prefs-title">Cookie Preferences</span>
              <button type="button" className="cookie-close" onClick={dismiss} aria-label="Close cookie preferences">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="cookie-pref-row">
              <span>Necessary</span>
              <span className="cookie-always">Always Active</span>
            </div>
            <div className="cookie-pref-row">
              <span>Analytics &amp; Optional</span>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                aria-label="Analytics and optional cookies"
                className={`cookie-switch${analytics ? ' is-on' : ''}`}
                onClick={() => setAnalytics((v) => !v)}
              >
                <span className="cookie-switch-knob" aria-hidden="true"></span>
              </button>
            </div>
            <div className="cookie-actions cookie-actions--prefs">
              <button type="button" className="cookie-btn" onClick={() => choose(analytics)}>Save Preferences</button>
              <button
                type="button"
                className="cookie-btn cookie-btn--quiet"
                aria-expanded="true"
                onClick={() => setView('banner')}
              >
                Manage Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="cookie-text">
              Essential cookies operate this website. Optional cookies may be used for analytics and improvement. Read our <a href="/privacy">Privacy Policy</a>.
            </p>
            <div className="cookie-actions">
              <button type="button" className="cookie-btn" onClick={() => choose(true)}>Accept All</button>
              <button type="button" className="cookie-btn" onClick={() => choose(false)}>Reject All</button>
              <button
                type="button"
                className="cookie-btn cookie-btn--quiet"
                aria-expanded="false"
                onClick={() => { setAnalytics(storedAnalytics()); setView('prefs'); }}
              >
                Manage Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
