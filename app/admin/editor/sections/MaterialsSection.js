'use client'
import { memo } from 'react'

/**
 * MaterialsSection — Editor component for the studio materials list.
 * Data stored in body as JSON: { items: [{ title: '...', body: '...' }] }
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

function parseItems(body) {
  try {
    const parsed = JSON.parse(body || '{}')
    return parsed.items || []
  } catch {
    return []
  }
}

function MaterialsSection({
  sectionKey, data, isSelected, selectedElement, onSelectElement,
  onUpdateField, styleOverrides, sectionStyleOverrides, viewMode, onSelect, page,
}) {
  const items = parseItems(data?.body)
  const eyebrow = data?.eyebrow || 'Materials'
  const title = data?.title || 'Solid wood, and why we don\'t use anything else.'

  const isElementSelected = (elementKey) =>
    selectedElement?.elementKey === elementKey

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
        background: '#EFE8DC', padding: '20px',
        outline: isSelected ? '2px solid #A78659' : '2px solid transparent',
        outlineOffset: '2px', borderRadius: '4px', cursor: 'pointer',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <ElementLabel elementKey="eyebrow" label="Eyebrow" />
          <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A78659' }}>
            {eyebrow}
          </span>
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ElementLabel elementKey="title" label="Title" />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2B221B', margin: 0, maxWidth: 400 }}>
            {title}
          </h3>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} style={{
            position: 'relative', borderTop: '1px solid rgba(43,34,27,0.1)',
            paddingTop: 12,
          }}>
            <ElementLabel elementKey={`item-${i}`} label={`Material ${i + 1}`} />
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#2B221B', margin: '0 0 4px' }}>
              {item.title || 'Material'}
            </h4>
            <p style={{ fontSize: '11px', color: '#61574F', margin: 0, lineHeight: 1.5 }}>
              {item.body || 'Description'}
            </p>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', fontSize: '11px', color: '#999', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
            No materials configured. Edit body JSON to add items.
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(MaterialsSection)
