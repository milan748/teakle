'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const TOOLBAR_BUTTON_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.1s',
  padding: 0,
}

const DIVIDER = { width: '1px', height: '20px', background: '#555', margin: '0 4px' }

export default function FloatingToolbar({
  selectedElement,
  styleOverrides,
  onStyleChange,
  instanceId,
  containerRef,
  viewMode = 'desktop',
}) {
  const toolbarRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false })

  const elementKey = selectedElement?.elementKey

  // Calculate toolbar position based on selected element
  const updatePosition = useCallback(() => {
    if (!elementKey || !containerRef?.current) {
      setPosition(prev => ({ ...prev, visible: false }))
      return
    }

    const canvas = containerRef.current
    const selectedEl = canvas.querySelector(`[data-element="${elementKey}"]`)
    if (!selectedEl) {
      setPosition(prev => ({ ...prev, visible: false }))
      return
    }

    const canvasRect = canvas.getBoundingClientRect()
    const elementRect = selectedEl.getBoundingClientRect()

    const top = elementRect.top - canvasRect.top - 44
    const left = elementRect.left - canvasRect.left + (elementRect.width / 2)

    setPosition({ top, left, visible: true })
  }, [elementKey, containerRef])

  useEffect(() => {
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    return () => window.removeEventListener('scroll', updatePosition, true)
  }, [updatePosition])

  if (!elementKey || !position.visible) return null

  const rawOverrides = (styleOverrides && styleOverrides[elementKey]) || {}
  const overrides = viewMode === 'tablet' && rawOverrides.tablet
    ? { ...rawOverrides, ...rawOverrides.tablet }
    : viewMode === 'mobile' && rawOverrides.mobile
    ? { ...rawOverrides, ...rawOverrides.mobile }
    : rawOverrides
  const set = (prop, val) => onStyleChange(instanceId, elementKey, prop, val)

  const isBold = overrides.fontWeight === '700' || overrides.fontWeight === 'bold'
  const isItalic = overrides.fontStyle === 'italic'
  const isUnderline = overrides.textDecoration === 'underline'
  const isUppercase = overrides.textTransform === 'uppercase'

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 6px',
        background: '#1a1a1a',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        zIndex: 1000,
        pointerEvents: 'auto',
        border: '1px solid #333',
      }}
    >
      {/* Bold */}
      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: isBold ? '#A78659' : 'transparent',
          fontWeight: 700,
        }}
        onClick={() => set('fontWeight', isBold ? undefined : '700')}
        title="Bold"
      >
        B
      </button>

      {/* Italic */}
      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: isItalic ? '#A78659' : 'transparent',
          fontStyle: 'italic',
        }}
        onClick={() => set('fontStyle', isItalic ? undefined : 'italic')}
        title="Italic"
      >
        I
      </button>

      {/* Underline */}
      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: isUnderline ? '#A78659' : 'transparent',
          textDecoration: 'underline',
        }}
        onClick={() => set('textDecoration', isUnderline ? undefined : 'underline')}
        title="Underline"
      >
        U
      </button>

      <div style={DIVIDER} />

      {/* Uppercase */}
      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: isUppercase ? '#A78659' : 'transparent',
          fontSize: '11px',
          letterSpacing: '0.05em',
        }}
        onClick={() => set('textTransform', isUppercase ? undefined : 'uppercase')}
        title="Uppercase"
      >
        AA
      </button>

      <div style={DIVIDER} />

      {/* Alignment */}
      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: overrides.textAlign === 'left' ? '#A78659' : 'transparent',
        }}
        onClick={() => set('textAlign', overrides.textAlign === 'left' ? undefined : 'left')}
        title="Align Left"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 2h12M1 5h8M1 8h10M1 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: overrides.textAlign === 'center' ? '#A78659' : 'transparent',
        }}
        onClick={() => set('textAlign', overrides.textAlign === 'center' ? undefined : 'center')}
        title="Align Center"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 2h12M3 5h8M2 8h10M4 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        style={{
          ...TOOLBAR_BUTTON_STYLE,
          background: overrides.textAlign === 'right' ? '#A78659' : 'transparent',
        }}
        onClick={() => set('textAlign', overrides.textAlign === 'right' ? undefined : 'right')}
        title="Align Right"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 2h12M5 5h8M3 8h10M7 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
