'use client'
import { memo } from 'react'

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

function PageIntroSection({
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
  const eyebrow = data?.eyebrow || 'Get in Touch'
  const title = data?.title || 'Let\'s Create Together'
  const subtitle = data?.subtitle || 'We\'d love to hear about your project.'
  const body = data?.body || 'Whether you\'re looking for a bespoke dining table, a custom built-in, or something entirely unique, we\'re here to help bring your vision to life. Every project starts with a conversation.'

  const paragraphs = body.split('\n\n').filter(Boolean)

  const infoBlocks = [
    { label: 'Location', value: 'Melbourne, VIC' },
    { label: 'Response Time', value: 'Within 24 hours' },
    { label: 'Consultation', value: 'Free initial consultation' },
  ]

  const isElementSelected = (elementKey) =>
    selectedElement?.elementKey === elementKey

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
        minHeight: '420px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-2xl)',
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
      {/* Left: Content */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        )}

        <div
          data-element="title"
          onClick={makeClickHandler('title')}
          style={{
            ...elementWrapperStyle('title'),
            marginBottom: subtitle ? 'var(--space-xs)' : 'var(--space-lg)',
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

        {subtitle && (
          <div
            data-element="subtitle"
            onClick={makeClickHandler('subtitle')}
            style={{
              ...elementWrapperStyle('subtitle'),
              marginBottom: 'var(--space-lg)',
            }}
          >
            <ElementLabel elementKey="subtitle" label="Subtitle" />
            <p
              contentEditable={isElementSelected('subtitle')}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit('subtitle', 'subtitle', e)}
              onClick={(e) => { e.stopPropagation(); onSelectElement?.('subtitle') }}
              style={{
                ...getStyle('subtitle', {
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }, styleOverrides, viewMode),
                cursor: isElementSelected('subtitle') ? 'text' : 'pointer',
                outline: 'none',
                minWidth: isElementSelected('subtitle') ? '200px' : undefined,
              }}
            >
              {subtitle}
            </p>
          </div>
        )}

        <div
          data-element="body"
          onClick={makeClickHandler('body')}
          style={{
            ...elementWrapperStyle('body'),
            marginBottom: 'var(--space-xl)',
          }}
        >
          <ElementLabel elementKey="body" label="Body" />
          <div
            contentEditable={isElementSelected('body')}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit('body', 'body', e)}
            onClick={(e) => { e.stopPropagation(); onSelectElement?.('body') }}
            style={{
              ...getStyle('body', {
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }, styleOverrides, viewMode),
              cursor: isElementSelected('body') ? 'text' : 'pointer',
              outline: 'none',
              minWidth: isElementSelected('body') ? '200px' : undefined,
            }}
          >
            {paragraphs.map((paragraph, i) => (
              <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? 'var(--space-md)' : 0 }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Info blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {infoBlocks.map((block, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 'var(--space-md)',
                padding: 'var(--space-sm) 0',
                borderTop: i === 0 ? '1px solid var(--stone)' : 'none',
                borderBottom: '1px solid var(--stone)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  minWidth: '120px',
                }}
              >
                {block.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--text-secondary)',
                }}
              >
                {block.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form placeholder */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '4px',
          padding: 'var(--space-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          minHeight: '340px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h3)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          Send us a message
        </p>

        {/* Name field placeholder */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Name
          </p>
          <div
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '2px',
              border: '1px solid var(--stone)',
              padding: '0 var(--space-sm)',
            }}
          />
        </div>

        {/* Email field placeholder */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Email
          </p>
          <div
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '2px',
              border: '1px solid var(--stone)',
              padding: '0 var(--space-sm)',
            }}
          />
        </div>

        {/* Message field placeholder */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Message
          </p>
          <div
            style={{
              width: '100%',
              height: '80px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '2px',
              border: '1px solid var(--stone)',
              padding: '0 var(--space-sm)',
            }}
          />
        </div>

        {/* Submit button placeholder */}
        <div
          style={{
            width: '100%',
            padding: '12px',
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
          Send Message
        </div>
      </div>
    </div>
  )
}

export default memo(PageIntroSection)
