import { requireAdmin } from '@/lib/auth';
import { getDraftSection } from '@/lib/cms';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { robots: 'noindex, nofollow' };

const VALID_PAGES = ['home', 'studio', 'contact', 'trade', 'custom', 'journal', 'archive'];

const PAGE_LABELS = {
  home: 'Homepage',
  studio: 'Studio',
  contact: 'Contact',
  trade: 'Trade',
  custom: 'Custom Orders',
  journal: 'Journal',
  archive: 'Archive',
};

export default async function PreviewPage({ params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    redirect('/admin/login');
  }

  const { page } = await params;

  if (!page || !VALID_PAGES.includes(page)) {
    redirect('/admin');
  }

  const sections = [];
  for (const key of getPageSectionKeys(page)) {
    const section = getDraftSection(page, key);
    if (section) sections.push(section);
  }

  const draftSections = sections.filter(s => s.status === 'draft');
  const publishedSections = sections.filter(s => s.status !== 'draft');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: '#1a1a1a', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>PREVIEW MODE</span>
          <span style={{ fontSize: '12px', color: '#999' }}>{PAGE_LABELS[page]}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#999' }}>Draft content — not visible to public</span>
          <Link href="/admin" style={{ background: 'white', color: '#1a1a1a', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
            Back to Admin
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {draftSections.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No draft changes</p>
            <p style={{ fontSize: '13px' }}>All sections are currently published.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {draftSections.map(section => (
              <div key={section.sectionKey} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#fff3cd', padding: '8px 16px', borderBottom: '1px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#856404' }}>
                    DRAFT — {section.sectionKey}
                  </span>
                  <span style={{ fontSize: '11px', color: '#856404' }}>
                    {section.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  {section.eyebrow && (
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '4px' }}>
                      {section.eyebrow}
                    </div>
                  )}
                  {section.title && (
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px', color: '#1a1a1a' }}>
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px', lineHeight: 1.6 }}>
                      {section.subtitle}
                    </p>
                  )}
                  {section.body && (
                    <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {section.body}
                    </div>
                  )}
                  {section.image && (
                    <div style={{ marginTop: '12px' }}>
                      <img src={section.image} alt="" style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                    </div>
                  )}
                  {section.buttonLabel && (
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ background: '#1a1a1a', color: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', display: 'inline-block' }}>
                        {section.buttonLabel}
                      </span>
                      {section.buttonUrl && (
                        <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>{section.buttonUrl}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {publishedSections.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '12px' }}>Published sections (unchanged)</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {publishedSections.map(section => (
                <div key={section.sectionKey} style={{ background: 'white', borderRadius: '6px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#333' }}>{section.sectionKey}</span>
                  <span style={{ fontSize: '11px', color: '#28a745', background: '#d4edda', padding: '2px 8px', borderRadius: '10px' }}>Published</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getPageSectionKeys(page) {
  const keys = {
    home: ['hero', 'philosophy', 'signature', 'craftsmanship', 'workshop-story', 'process-story'],
    studio: ['hero', 'origin', 'gallery'],
    contact: ['hero', 'introduction'],
    trade: ['hero', 'introduction'],
    custom: ['hero', 'introduction'],
    journal: ['hero'],
    archive: ['hero'],
  };
  return keys[page] || [];
}
