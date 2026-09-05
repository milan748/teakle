'use client'

export default function HeroSection({ data, isSelected, onSelect, page }) {
  const eyebrow = data?.eyebrow || 'Handcrafted in Melbourne'
  const title = data?.title || 'Teakle'
  const subtitle = data?.subtitle || 'Artisan furniture crafted from sustainably sourced Australian hardwoods.'
  const image = data?.image || '/assets/hero-luxury-entryway.png'
  const buttonLabel = data?.buttonLabel || 'Explore Our Work'
  const buttonUrl = data?.buttonUrl || '/studio'

  const titleLines = title.split('\n')

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '480px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(43, 34, 27, 0.6)',
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
          maxWidth: '720px',
        }}
      >
        {eyebrow && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-label)',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#A78659',
              marginBottom: 'var(--space-md)',
            }}
          >
            {eyebrow}
          </p>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h1)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: '#F7F4EE',
            marginBottom: 'var(--space-lg)',
          }}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              lineHeight: 1.6,
              color: '#EFE8DC',
              marginBottom: 'var(--space-xl)',
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {subtitle}
          </p>
        )}

        {buttonLabel && (
          <div
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              border: '1px solid #A78659',
              color: '#F7F4EE',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-label)',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '2px',
            }}
          >
            {buttonLabel}
          </div>
        )}
      </div>
    </div>
  )
}
