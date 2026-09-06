'use client'

function getStyle(elementKey, defaults, styleOverrides) {
  const overrides = styleOverrides?.[elementKey] || {}
  return { ...defaults, ...overrides }
}

export default function PageGallerySection({
  sectionKey,
  data,
  isSelected,
  selectedElement,
  onSelectElement,
  onUpdateField,
  styleOverrides,
  onSelect,
  page,
}) {
  const eyebrow = data?.eyebrow || 'Gallery'
  const title = data?.title || 'Workshop & Process'
  const images = [
    data?.image || '/images/gallery-1.jpg',
    '/images/gallery-2.jpg',
    '/images/gallery-3.jpg',
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
        minHeight: '400px',
        padding: 'var(--space-2xl)',
        backgroundColor: 'var(--walnut)',
        cursor: 'pointer',
        borderRadius: '4px',
        border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        {eyebrow && (
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
                  fontSize: 'var(--text-label)',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#A78659',
                }, styleOverrides),
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
              }, styleOverrides),
              cursor: isElementSelected('title') ? 'text' : 'pointer',
              outline: 'none',
              minWidth: isElementSelected('title') ? '200px' : undefined,
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* 3-image grid */}
      <div
        data-element="image"
        onClick={makeClickHandler('image')}
        style={{
          ...elementWrapperStyle('image'),
        }}
      >
        <ElementLabel elementKey="image" label="Image" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-sm)',
            maxHeight: '280px',
            overflow: 'hidden',
            borderRadius: '4px',
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                paddingTop: '100%',
                backgroundImage: `url(${img})`,
                backgroundSize: styleOverrides?.image?.backgroundSize || 'cover',
                backgroundPosition: styleOverrides?.image?.backgroundPosition || 'center',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
