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

export default function LifestyleSection({
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
  const eyebrow = data?.eyebrow || 'Behind the Scenes'
  const title = data?.title || 'The Workshop'
  const body = data?.body || 'Step inside our Melbourne workshop where sawdust settles on workbenches that have shaped hundreds of pieces. Every tool has its place, every cut its purpose.'
  const image = data?.image || '/images/workshop.jpg'
  const buttonLabel = data?.buttonLabel || 'Learn More'
  const buttonUrl = data?.buttonUrl || '/studio'

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
        position: 'relative',
        width: '100%',
        minHeight: '420px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: '4px',
        border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Background Image — clickable element overlay */}
      <div
        data-element="image"
        onClick={makeClickHandler('image')}
        style={{
          ...elementWrapperStyle('image'),
          position: 'absolute',
          inset: 0,
        }}
      >
        <ElementLabel elementKey="image" label="Image" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: styleOverrides?.image?.backgroundSize || 'cover',
            backgroundPosition: focalPointToBackgroundPosition(resolveFocalPoint(styleOverrides, 'image', viewMode)),
            zIndex: 0,
          }}
        />
      </div>

      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(43, 34, 27, 0.65)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: 'var(--space-xl)',
          maxWidth: '640px',
        }}
      >
        {eyebrow && (
          <div
            data-element="eyebrow"
            onClick={makeClickHandler('eyebrow')}
            style={{
              ...elementWrapperStyle('eyebrow'),
              marginBottom: 'var(--space-md)',
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
                  fontSize: 'var(--text-label)',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#A78659',
                }, styleOverrides, viewMode),
                cursor: isElementSelected('eyebrow') ? 'text' : 'pointer',
                outline: 'none',
                minWidth: isElementSelected('eyebrow') ? '60px' : undefined,
              }}
            >
              {eyebrow}
            </p>
          </div>
        )}

        <div
          data-element="title"
          onClick={makeClickHandler('title')}
          style={{
            ...elementWrapperStyle('title'),
            marginBottom: 'var(--space-lg)',
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
                color: '#F7F4EE',
              }, styleOverrides, viewMode),
              cursor: isElementSelected('title') ? 'text' : 'pointer',
              outline: 'none',
              minWidth: isElementSelected('title') ? '200px' : undefined,
            }}
          >
            {title}
          </h2>
        </div>

        {body && (
          <div
            data-element="body"
            onClick={makeClickHandler('body')}
            style={{
              ...elementWrapperStyle('body'),
              marginBottom: 'var(--space-lg)',
            }}
          >
            <ElementLabel elementKey="body" label="Body" />
            <p
              contentEditable={isElementSelected('body')}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit('body', 'body', e)}
              onClick={(e) => { e.stopPropagation(); onSelectElement?.('body') }}
              style={{
                ...getStyle('body', {
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.7,
                  color: '#EFE8DC',
                }, styleOverrides, viewMode),
                cursor: isElementSelected('body') ? 'text' : 'pointer',
                outline: 'none',
                minWidth: isElementSelected('body') ? '200px' : undefined,
              }}
            >
              {body}
            </p>
          </div>
        )}

        {buttonLabel && (
          <div
            data-element="button"
            onClick={makeClickHandler('button')}
            style={{
              ...elementWrapperStyle('button'),
              display: 'inline-block',
              textAlign: styleOverrides?.button?.alignment || 'center',
            }}
          >
            <ElementLabel elementKey="button" label="CTA" />
            <div
              contentEditable={isElementSelected('button')}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit('button', 'buttonLabel', e)}
              onClick={(e) => { e.stopPropagation(); onSelectElement?.('button') }}
              style={{
                ...getStyle('button', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 32px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-label)',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                }, {
                  ...styleOverrides,
                  button: {
                    ...getButtonVariantStyles(styleOverrides?.button?.variant),
                    ...styleOverrides?.button,
                  },
                }, viewMode),
                cursor: isElementSelected('button') ? 'text' : 'pointer',
                outline: 'none',
                minWidth: isElementSelected('button') ? '60px' : undefined,
              }}
            >
              {buttonLabel}
              <span style={{ fontSize: '12px' }}>&#8594;</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
