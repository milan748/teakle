'use client'

/**
 * TrustBarSection — Editor component for the trust bar.
 * Renders trust items (icon + text) in a horizontal bar.
 * Data stored in body as JSON: { items: [{ icon: 'shield', text: '...' }] }
 */

function getStyle(elementKey, defaults, styleOverrides, viewMode) {
  const overrides = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }
  for (const [key, val] of Object.entries(overrides)) {
    if (key !== 'mobile' && key !== 'tablet') base[key] = val
  }
  if (viewMode === 'tablet' && overrides.tablet) {
    for (const [key, val] of Object.entries(overrides.tablet)) {
      base[key] = val
    }
  }
  if (viewMode === 'mobile' && overrides.mobile) {
    for (const [key, val] of Object.entries(overrides.mobile)) {
      base[key] = val
    }
  }
  return base
}

const ICONS = {
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

function parseItems(body) {
  try {
    const parsed = JSON.parse(body || '{}')
    return parsed.items || []
  } catch {
    return []
  }
}

export default function TrustBarSection({
  sectionKey, data, isSelected, selectedElement, onSelectElement,
  onUpdateField, styleOverrides, sectionStyleOverrides, viewMode, onSelect, page,
}) {
  const items = parseItems(data?.body)

  const isElementSelected = (elementKey) =>
    selectedElement?.sectionKey === sectionKey && selectedElement?.elementKey === elementKey

  const handleSectionClick = (e) => {
    if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) {
      onSelect?.()
    }
  }

  const ElementLabel = ({ elementKey, label }) => {
    if (!isElementSelected(elementKey)) return null
    return (
      <div style={{
        position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)',
        background: '#A78659', color: '#fff', fontSize: '10px', fontWeight: 500,
        padding: '2px 8px', borderRadius: '3px', whiteSpace: 'nowrap', zIndex: 10,
      }}>{label}</div>
    )
  }

  return (
    <div
      onClick={handleSectionClick}
      style={{
        background: '#EFE8DC', padding: '12px 20px',
        outline: isSelected ? '2px solid #A78659' : '2px solid transparent',
        outlineOffset: '2px', borderRadius: '4px', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ElementLabel elementKey={`item-${i}`} label={`Item ${i + 1}`} />
            <span style={{ width: 16, height: 16, color: '#A78659', flexShrink: 0 }}>
              {ICONS[item.icon] || ICONS.shield}
            </span>
            <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#61574F' }}>
              {item.text || 'Trust Item'}
            </span>
          </div>
        )) : (
          <div style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
            No trust items configured. Edit body JSON to add items.
          </div>
        )}
      </div>
    </div>
  )
}
