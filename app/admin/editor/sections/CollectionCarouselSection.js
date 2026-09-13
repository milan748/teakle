'use client'

/**
 * CollectionCarouselSection — Editor component for the product carousel.
 * Data stored in body as JSON: { productIds: ['anchor-table', ...] }
 * Product metadata comes from products.js — CMS only stores selected IDs.
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

function parseProductIds(body) {
  try {
    const parsed = JSON.parse(body || '{}')
    return parsed.productIds || []
  } catch {
    return []
  }
}

export default function CollectionCarouselSection({
  sectionKey, data, isSelected, selectedElement, onSelectElement,
  onUpdateField, styleOverrides, sectionStyleOverrides, viewMode, onSelect, page,
}) {
  const productIds = parseProductIds(data?.body)
  const eyebrow = data?.eyebrow || ''
  const title = data?.title || 'Collection'

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
        background: '#F7F4EE', padding: '20px',
        outline: isSelected ? '2px solid #A78659' : '2px solid transparent',
        outlineOffset: '2px', borderRadius: '4px', cursor: 'pointer',
      }}
    >
      {eyebrow && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <ElementLabel elementKey="eyebrow" label="Eyebrow" />
          <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A78659' }}>
            {eyebrow}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <ElementLabel elementKey="title" label="Title" />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2B221B', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {productIds.length > 0 ? productIds.map((id, i) => (
          <div key={i} style={{
            position: 'relative', minWidth: 140, background: '#EFE8DC', borderRadius: 4,
            padding: 12, textAlign: 'center',
          }}>
            <ElementLabel elementKey={`product-${i}`} label={`Product ${i + 1}`} />
            <div style={{ width: '100%', aspectRatio: '4/3', background: '#C9C1B6', borderRadius: 2, marginBottom: 8 }} />
            <span style={{ fontSize: '10px', color: '#61574F' }}>{id}</span>
          </div>
        )) : (
          <div style={{ fontSize: '11px', color: '#999', fontStyle: 'italic', padding: 20 }}>
            No products selected. Edit body JSON to add productIds.
          </div>
        )}
      </div>
    </div>
  )
}
