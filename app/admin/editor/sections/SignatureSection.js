'use client'

import { resolveFocalPoint, focalPointToBackgroundPosition } from '@/lib/designResolution'

function getStyle(elementKey, defaults, styleOverrides, viewMode) {
  const overrides = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }
  
  // Apply desktop overrides
  for (const [key, val] of Object.entries(overrides)) {
    if (key !== 'mobile' && key !== 'tablet') base[key] = val
  }
  
  // Apply tablet overrides when in tablet view
  if (viewMode === 'tablet' && overrides.tablet) {
    for (const [key, val] of Object.entries(overrides.tablet)) {
      base[key] = val
    }
  }
  
  // Apply mobile overrides when in mobile view
  if (viewMode === 'mobile' && overrides.mobile) {
    for (const [key, val] of Object.entries(overrides.mobile)) {
      base[key] = val
    }
  }
  
  return base
}

export default function SignatureSection({
  sectionKey,
  data,
  isSelected,
  selectedElement,
  onSelectElement,
  onUpdateField,
  styleOverrides,
  viewMode,
  onSelect,
  page,
}) {
  const eyebrow = data?.eyebrow || 'Signature Collection'
  const title = data?.title || 'The Meridian Dining Table'
  const body = data?.body || 'Handcrafted from a single slab of Victorian Ash, the Meridian Dining Table celebrates the natural beauty of Australian hardwood. Each table is unique, bearing the distinctive grain patterns and character of its timber.'
  const image = data?.image || '/images/signature-table.jpg'

  const features = [
    'Sustainably sourced Victorian Ash',
    'Hand-finished natural oil treatment',
    'Solid brass detailing',
    'Lifetime structural guarantee',
  ]

  const isElementSelected = (elementKey) =>
    selectedElement?.sectionKey === sectionKey && selectedElement?.elementKey === elementKey

  const handleSectionClick = (e) => {
    if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) {
      onSelect?.()
    }
  }

  const getButtonVariantStyles = (variant) => {
    switch (variant) {
      case 'filled': return { background: '#A78659', color: '#fff', border: '1px solid #A78659' }
      case 'ghost': return { background: 'transparent', color: '#A78659', border: 'none' }
      default: return { background: 'transparent', color: '#F7F4EE', border: '1px solid #A78659' }
    }
  }

  const elementWrapperStyle = (elementKey) => ({
    position: 'relative',
    cursor: 'pointer',
    outline: isElementSelected(elementKey) ? '2px solid #A78659' : '2px solid transparent',
    outlineOffset: '4px',
    borderRadius: '2px',
    transition: 'outline-color 0.15s',
  })

  const ElementLabel = ({ elementKey, label }) => {
    if (!isElementSelected(elementKey)) return null
    return (
      <div style={{
        position: 'absolute',
        top: '-24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#A78659',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: '3px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {label}
      </div>
    )
  }

  const handleInlineEdit = (elementKey, field, e) => {
    if (!onUpdateField) return
    const newValue = e.currentTarget.innerText.trim()
    if (newValue !== (data?.[field] || '')) {
      onUpdateField(sectionKey, field, newValue)
    }
  }

  const makeClickHandler = (elementKey) => (e) => {
    e.stopPropagation()
    onSelectElement?.(elementKey)
  }

  return (
    <div
      onClick={handleSectionClick}
      style={{
        width: '100%',
        minHeight: '520px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-xl)',
        padding: 'var(--space-2xl)',
        backgroundColor: 'var(--bg-primary)',
        cursor: 'pointer',
        borderRadius: '4px',
        border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        alignItems: 'center',
      }}
    >
      {/* Left: Image with badge */}
      <div
        data-element="image"
        onClick={makeClickHandler('image')}
        style={{
          ...elementWrapperStyle('image'),
          position: 'relative',
        }}
      >
        <ElementLabel elementKey="image" label="Image" />
        <div
          style={{
            width: '100%',
            paddingTop: '120%',
            backgroundImage: `url(${image})`,
            backgroundSize: styleOverrides?.image?.backgroundSize || 'cover',
            backgroundPosition: focalPointToBackgroundPosition(resolveFocalPoint(styleOverrides, 'image', viewMode)),
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            left: 'var(--space-md)',
            backgroundColor: 'var(--walnut)',
            color: '#F7F4EE',
            padding: '6px 14px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-caption)',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderRadius: '2px',
          }}
        >
          Signature
        </div>
      </div>

      {/* Right: Product info */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          data-element="eyebrow"
          onClick={makeClickHandler('eyebrow')}
          style={{
            ...elementWrapperStyle('eyebrow'),
            marginBottom: 'var(--space-sm)',
          }}
        >
          <ElementLabel elementKey="eyebrow" label="Eyebrow" />
          <p
            contentEditable={isElementSelected('eyebrow')}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit('eyebrow', 'eyebrow', e)}
            onClick={(e) => { e.stopPropagation(); onSelectElement?.('eyebrow') }}
            style={{
              ...getStyle('eyebrow', {
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--bronze)',
              }, styleOverrides, viewMode),
              cursor: isElementSelected('eyebrow') ? 'text' : 'pointer',
              outline: 'none',
              minWidth: isElementSelected('eyebrow') ? '60px' : undefined,
            }}
          >
            {eyebrow}
          </p>
        </div>

        <div
          data-element="title"
          onClick={makeClickHandler('title')}
          style={{
            ...elementWrapperStyle('title'),
            marginBottom: 'var(--space-xs)',
          }}
        >
          <ElementLabel elementKey="title" label="Title" />
          <h2
            contentEditable={isElementSelected('title')}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit('title', 'title', e)}
            onClick={(e) => { e.stopPropagation(); onSelectElement?.('title') }}
            style={{
              ...getStyle('title', {
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h2)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: 'var(--text-primary)',
              }, styleOverrides, viewMode),
              cursor: isElementSelected('title') ? 'text' : 'pointer',
              outline: 'none',
              minWidth: isElementSelected('title') ? '200px' : undefined,
            }}
          >
            {title}
          </h2>
        </div>

        <div
          data-element="body"
          onClick={makeClickHandler('body')}
          style={{
            ...elementWrapperStyle('body'),
          }}
        >
          <ElementLabel elementKey="body" label="Body" />
          <div
            style={getStyle('body', {
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }, styleOverrides, viewMode)}
          >
            <p
              contentEditable={isElementSelected('body')}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit('body', 'body', e)}
              onClick={(e) => { e.stopPropagation(); onSelectElement?.('body') }}
              style={{
                marginBottom: 'var(--space-lg)',
                cursor: isElementSelected('body') ? 'text' : 'pointer',
                outline: 'none',
                minWidth: isElementSelected('body') ? '200px' : undefined,
              }}
            >
              {body}
            </p>
          </div>
        </div>

        {/* Features */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            marginBottom: 'var(--space-lg)',
          }}
        >
          {features.map((feature, i) => (
            <li
              key={i}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                color: 'var(--text-secondary)',
                padding: '6px 0',
                borderBottom: '1px solid var(--stone)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: 'var(--bronze)', fontSize: '10px' }}>&#9670;</span>
              {feature}
            </li>
          ))}
        </ul>

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h3)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          From $4,200
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <div
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--walnut)',
              color: '#F7F4EE',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-label)',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            Enquire Now
          </div>
          <div
            style={{
              padding: '12px 28px',
              border: '1px solid var(--bronze)',
              color: 'var(--bronze)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-label)',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            View Details
          </div>
        </div>

        {/* Maker card */}
        <div
          style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            borderTop: '1px solid var(--stone)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              color: 'var(--walnut)',
            }}
          >
            JT
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Jake Teakle
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Founder &amp; Master Craftsman
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
