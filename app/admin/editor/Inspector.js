'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FONT_SIZE_PRESETS, FONT_WEIGHT_PRESETS, LINE_HEIGHT_PRESETS,
  SPACING_TOKENS, ALIGNMENT_OPTIONS, IMAGE_FIT_OPTIONS,
  BUTTON_VARIANTS, BUTTON_SIZES,
  getVariantsForSection
} from './sections/registry'
import PageDesignPanel from './PageDesignPanel'

/* ── Helpers ───────────────────────────────────────────────────────────────── */

// Read content value preferring draft field over published
function getFieldValue(sectionData, fieldKey) {
  if (!sectionData) return ''
  const draftKey = 'draft' + fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
  return sectionData[draftKey] ?? sectionData[fieldKey] ?? ''
}

function getStatus(sectionData) {
  if (!sectionData) return { label: 'Using fallback', color: '#6c757d' }
  const hasDraft = sectionData.status === 'draft'
  if (hasDraft && sectionData.enabled) return { label: 'Published + draft', color: '#e67e22' }
  if (hasDraft && !sectionData.enabled) return { label: 'Draft changes', color: '#e67e22' }
  if (sectionData.enabled) return { label: 'Published', color: '#28a745' }
  return { label: 'Disabled', color: '#dc3545' }
}

/* ── Shared styles ─────────────────────────────────────────────────────────── */

const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 500,
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
  display: 'block',
}

const TEXT_INPUT_STYLE = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #444',
  borderRadius: '4px',
  fontSize: '12px',
  background: '#1a1a1a',
  color: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}

/* ── Pill Button Group ─────────────────────────────────────────────────────── */

function PillGroup({ options, value, onChange, style: extraStyle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', ...extraStyle }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(opt.value)
              }
            }}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              background: active ? '#A78659' : '#333',
              color: active ? '#fff' : '#ccc',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Collapsible Group ─────────────────────────────────────────────────────── */

function ControlGroup({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef(null)

  return (
    <div style={{ marginBottom: '2px' }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(prev => !prev)
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid #333',
          cursor: 'pointer',
          color: '#999',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '10px', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          maxHeight: open ? (contentRef.current ? contentRef.current.scrollHeight + 'px' : '500px') : '0',
          overflow: 'hidden',
          transition: 'max-height 0.2s ease-in-out',
        }}
      >
        <div style={{ padding: '10px 0 6px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── Typography Controls ───────────────────────────────────────────────────── */

function TypographyControls({ elementKey, styleOverrides, onStyleChange, instanceId, defaultOpen = true }) {
  const overrides = (styleOverrides && styleOverrides[elementKey]) || {}

  const set = (prop, val) => onStyleChange(instanceId, elementKey, prop, val)

  return (
    <ControlGroup title="Typography" defaultOpen={defaultOpen}>
      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Size</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min="10"
            max="120"
            step="1"
            value={overrides.fontSize ? parseInt(overrides.fontSize) : ''}
            placeholder="Default"
            onChange={(e) => {
              const v = e.target.value
              set('fontSize', v === '' ? undefined : v + 'px')
            }}
            style={{
              ...TEXT_INPUT_STYLE,
              width: '70px',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '11px', color: '#666' }}>px</span>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Weight</span>
        <PillGroup
          options={FONT_WEIGHT_PRESETS}
          value={overrides.fontWeight}
          onChange={(v) => set('fontWeight', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Style</span>
        <PillGroup
          options={[
            { label: 'Normal', value: 'normal' },
            { label: 'Italic', value: 'italic' },
          ]}
          value={overrides.fontStyle}
          onChange={(v) => set('fontStyle', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Line Height</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min="0.8"
            max="2.5"
            step="0.05"
            value={overrides.lineHeight ? parseFloat(overrides.lineHeight) : ''}
            placeholder="Default"
            onChange={(e) => {
              const v = e.target.value
              set('lineHeight', v === '' ? undefined : v)
            }}
            style={{
              ...TEXT_INPUT_STYLE,
              width: '70px',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Letter Spacing</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min="-0.05"
            max="0.3"
            step="0.01"
            value={overrides.letterSpacing ? parseFloat(overrides.letterSpacing) : ''}
            placeholder="0"
            onChange={(e) => {
              const v = e.target.value
              set('letterSpacing', v === '' ? undefined : v + 'em')
            }}
            style={{
              ...TEXT_INPUT_STYLE,
              width: '70px',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '11px', color: '#666' }}>em</span>
        </div>
      </div>

      <div>
        <span style={LABEL_STYLE}>Alignment</span>
        <PillGroup
          options={ALIGNMENT_OPTIONS.map(a => ({ label: a.label, value: a.value }))}
          value={overrides.textAlign}
          onChange={(v) => set('textAlign', v)}
        />
      </div>
    </ControlGroup>
  )
}

/* ── Spacing Controls ──────────────────────────────────────────────────────── */
function SpacingControls({ elementKey, styleOverrides, onStyleChange, instanceId, defaultOpen = true }) {
  const overrides = (styleOverrides && styleOverrides[elementKey]) || {}

  const set = (prop, val) => onStyleChange(instanceId, elementKey, prop, val)

  return (
    <ControlGroup title="Spacing" defaultOpen={defaultOpen}>
      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Padding Top</span>
        <PillGroup
          options={SPACING_TOKENS}
          value={overrides.paddingTop}
          onChange={(v) => set('paddingTop', v)}
        />
      </div>
      <div>
        <span style={LABEL_STYLE}>Padding Bottom</span>
        <PillGroup
          options={SPACING_TOKENS}
          value={overrides.paddingBottom}
          onChange={(v) => set('paddingBottom', v)}
        />
      </div>
    </ControlGroup>
  )
}

/* ── Section Controls ─────────────────────────────────────────────────────── */

function SectionControls({ instanceId, sectionStyleOverrides, onSectionStyleChange }) {
  const overrides = sectionStyleOverrides || {}

  const set = (prop, val) => onSectionStyleChange(instanceId, prop, val)

  return (
    <ControlGroup title="Section">
      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Content Width</span>
        <PillGroup
          options={[
            { label: 'Narrow', value: '800px' },
            { label: 'Standard', value: '1200px' },
            { label: 'Wide', value: '1600px' },
          ]}
          value={overrides.contentWidth}
          onChange={(v) => set('contentWidth', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Alignment</span>
        <PillGroup
          options={ALIGNMENT_OPTIONS.map(a => ({ label: a.label, value: a.value }))}
          value={overrides.alignment}
          onChange={(v) => set('alignment', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Padding Top</span>
        <PillGroup
          options={SPACING_TOKENS}
          value={overrides.paddingTop}
          onChange={(v) => set('paddingTop', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Padding Bottom</span>
        <PillGroup
          options={SPACING_TOKENS}
          value={overrides.paddingBottom}
          onChange={(v) => set('paddingBottom', v)}
        />
      </div>

      <div>
        <span style={LABEL_STYLE}>Background</span>
        <PillGroup
          options={[
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: 'Warm', value: 'warm' },
            { label: 'Stone', value: 'stone' },
          ]}
          value={overrides.backgroundPreset}
          onChange={(v) => set('backgroundPreset', v)}
        />
      </div>
    </ControlGroup>
  )
}

/* ── Image Controls ────────────────────────────────────────────────────────── */

function FocalPointPicker({ focalX, focalY, imageUrl, imageLabel, onChange, onReset }) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const x = typeof focalX === 'number' ? focalX : 50
  const y = typeof focalY === 'number' ? focalY : 50

  const updateFromEvent = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const nx = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const ny = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
    onChange(Math.round(nx), Math.round(ny))
  }, [onChange])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    updateFromEvent(e)
  }, [updateFromEvent])

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e) => { e.preventDefault(); updateFromEvent(e) }
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, updateFromEvent])

  const handleKeyDown = useCallback((e) => {
    const step = e.shiftKey ? 10 : 2
    let nx = x, ny = y
    switch (e.key) {
      case 'ArrowLeft':  nx = Math.max(0, x - step); break
      case 'ArrowRight': nx = Math.min(100, x + step); break
      case 'ArrowUp':    ny = Math.max(0, y - step); break
      case 'ArrowDown':  ny = Math.min(100, y + step); break
      case 'Home': case '0': nx = 0; break
      case 'End': case '1': nx = 100; break
      case 'r': case 'R': onReset(); return
      default: return
    }
    e.preventDefault()
    onChange(nx, ny)
  }, [x, y, onChange, onReset])

  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        ref={containerRef}
        role="slider"
        aria-label={`Focal point for ${imageLabel || 'image'}`}
        aria-valuetext={`${x}% horizontal, ${y}% vertical`}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '60%',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #444',
          background: '#1a1a1a',
          cursor: 'crosshair',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.5)' }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        )}
        {/* Focal point marker */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: '16px',
            height: '16px',
            marginLeft: '-8px',
            marginTop: '-8px',
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0 0 4px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        {/* Crosshair lines */}
        <div aria-hidden="true" style={{ position: 'absolute', left: `${x}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: `${y}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '11px', color: '#888' }}>{x}% / {y}%</span>
        <button
          type="button"
          onClick={onReset}
          style={{
            fontSize: '10px',
            color: '#999',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function ImageControls({ element, elementKey, instanceId, sectionData, styleOverrides, onStyleChange, onFieldChange, onOpenMedia, defaultOpen = true }) {
  const contentValue = getFieldValue(sectionData, element.contentField)
  const overrides = (styleOverrides && styleOverrides[elementKey]) || {}
  const set = (prop, val) => onStyleChange(instanceId, elementKey, prop, val)

  const handleFocalChange = useCallback((fx, fy) => {
    set('focalX', fx)
    set('focalY', fy)
  }, [set])

  const handleFocalReset = useCallback(() => {
    set('focalX', 50)
    set('focalY', 50)
  }, [set])

  return (
    <>
      <ControlGroup title="Image" defaultOpen={defaultOpen}>
        {contentValue && (
          <div style={{
            marginBottom: '8px',
            border: '1px solid #444',
            borderRadius: '4px',
            overflow: 'hidden',
            background: '#1a1a1a',
          }}>
            <img
              src={contentValue}
              alt={element.label}
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => onOpenMedia(element.contentField)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenMedia(element.contentField)
            }
          }}
          style={{
            width: '100%',
            padding: '6px 10px',
            background: '#333',
            color: '#ccc',
            border: '1px solid #444',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          Replace Image
        </button>
        <input
          type="text"
          value={contentValue}
          placeholder="Image URL"
          onChange={(e) => onFieldChange(instanceId, element.contentField, e.target.value)}
          style={TEXT_INPUT_STYLE}
        />
      </ControlGroup>

      {element.capabilities.includes('fit') && (
        <ControlGroup title="Fit" defaultOpen={false}>
          <span style={LABEL_STYLE}>Object Fit</span>
          <PillGroup
            options={IMAGE_FIT_OPTIONS}
            value={overrides.objectFit}
            onChange={(v) => set('objectFit', v)}
          />
        </ControlGroup>
      )}

      {element.capabilities.includes('position') && (
        <ControlGroup title="Focal Point" defaultOpen={false}>
          <span style={LABEL_STYLE}>Drag to set crop focus</span>
          <FocalPointPicker
            focalX={overrides.focalX}
            focalY={overrides.focalY}
            imageUrl={contentValue}
            imageLabel={element.label}
            onChange={handleFocalChange}
            onReset={handleFocalReset}
          />
        </ControlGroup>
      )}
    </>
  )
}

/* ── Button Element Controls ───────────────────────────────────────────────── */

function ButtonElementControls({ element, elementKey, instanceId, sectionData, styleOverrides, onStyleChange, onFieldChange, defaultOpen = true }) {
  const labelValue = getFieldValue(sectionData, element.contentField)
  const urlValue = getFieldValue(sectionData, element.urlField)
  const overrides = (styleOverrides && styleOverrides[elementKey]) || {}
  const set = (prop, val) => onStyleChange(instanceId, elementKey, prop, val)

  return (
    <>
      <ControlGroup title="Content" defaultOpen={defaultOpen}>
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Label</span>
          <input
            type="text"
            value={labelValue}
            onChange={(e) => onFieldChange(instanceId, element.contentField, e.target.value)}
            style={TEXT_INPUT_STYLE}
          />
        </div>
        <div>
          <span style={LABEL_STYLE}>URL</span>
          <input
            type="text"
            value={urlValue}
            placeholder="https://..."
            onChange={(e) => onFieldChange(instanceId, element.urlField, e.target.value)}
            style={TEXT_INPUT_STYLE}
          />
        </div>
      </ControlGroup>

      {element.capabilities.includes('variant') && (
        <ControlGroup title="Style" defaultOpen={false}>
          <div style={{ marginBottom: '10px' }}>
            <span style={LABEL_STYLE}>Variant</span>
            <PillGroup
              options={BUTTON_VARIANTS}
              value={overrides.variant}
              onChange={(v) => set('variant', v)}
            />
          </div>
          <div>
            <span style={LABEL_STYLE}>Size</span>
            <PillGroup
              options={BUTTON_SIZES}
              value={overrides.size}
              onChange={(v) => set('size', v)}
            />
          </div>
        </ControlGroup>
      )}

      {element.capabilities.includes('alignment') && (
        <ControlGroup title="Alignment" defaultOpen={false}>
          <span style={LABEL_STYLE}>Alignment</span>
          <PillGroup
            options={ALIGNMENT_OPTIONS}
            value={overrides.alignment}
            onChange={(v) => set('alignment', v)}
          />
        </ControlGroup>
      )}
    </>
  )
}

/* ── Main Inspector ────────────────────────────────────────────────────────── */

export default function Inspector({
  instanceId,
  sectionKey,
  sectionData,
  sectionConfig,
  page,
  selectedElement,
  elements,
  styleOverrides = {},
  sectionStyleOverrides = {},
  viewMode = 'desktop',
  onFieldChange,
  onStyleChange,
  onSectionStyleChange,
  onVariantChange,
  onSave,
  onPublish,
  onDiscard,
  onOpenMedia,
  saving,
  pageDesign = {},
  showPageDesign = false,
  onPageDesignChange,
}) {
  /* Local state for enabled toggle (mirrors sectionData for instant feedback) */
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (sectionData) {
      const val = sectionData.draftEnabled != null
        ? (sectionData.draftEnabled === 1 || sectionData.draftEnabled === true)
        : (sectionData.enabled === 1 || sectionData.enabled === true)
      setEnabled(val)
    }
  }, [sectionData])

  const handleEnabled = useCallback((checked) => {
    setEnabled(checked)
    onFieldChange(instanceId, 'enabled', checked ? 1 : 0)
  }, [instanceId, onFieldChange])

  const hasDraft = sectionData?.status === 'draft'
  const status = getStatus(sectionData)

  /* ── Resolve the active element definition (if one is selected) ──────── */
  const activeElement = selectedElement && elements
    ? elements.find(el => {
        // Match by elementKey — elements array is positional so use index-based key
        const idx = elements.indexOf(el)
        return selectedElement.elementKey === `${selectedElement.sectionKey}-el-${idx}`
          || selectedElement.elementKey === el.contentField
      }) || null
    : null

  /* Fallback: if selectedElement exists but we couldn't match by key above,
     try matching by contentField directly (elementKey might be the field name) */
  const resolvedElement = activeElement || (selectedElement && elements
    ? elements.find(el => el.contentField === selectedElement.elementKey) || null
    : null)

  /* ── Resolve responsive overrides for current viewport ────────────────── */
  function resolveOverrides(overrides, elementKey) {
    const el = overrides[elementKey] || {}
    if (viewMode === 'tablet' && el.tablet) return { ...el, ...el.tablet }
    if (viewMode === 'mobile' && el.mobile) return { ...el, ...el.mobile }
    return el
  }

  function resolveSectionOverrides(sectionOverrides) {
    const responsive = viewMode === 'tablet' ? sectionOverrides.tablet
      : viewMode === 'mobile' ? sectionOverrides.mobile : null
    return responsive ? { ...sectionOverrides, ...responsive } : sectionOverrides
  }

  /* Resolved styleOverrides: merges responsive subkey into top level for child components */
  const resolvedStyleOverrides = {}
  for (const [elKey, elOverrides] of Object.entries(styleOverrides)) {
    if (viewMode === 'tablet' && elOverrides.tablet) {
      resolvedStyleOverrides[elKey] = { ...elOverrides, ...elOverrides.tablet }
    } else if (viewMode === 'mobile' && elOverrides.mobile) {
      resolvedStyleOverrides[elKey] = { ...elOverrides, ...elOverrides.mobile }
    } else {
      resolvedStyleOverrides[elKey] = elOverrides
    }
  }

  /* ── Panel layout wrapper ──────────────────────────────────────────── */
  const panelStyle = {
    width: '320px',
    background: '#222',
    borderLeft: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  }

  /* ── Page Design mode ──────────────────────────────────────────────── */
  if (showPageDesign && onPageDesignChange) {
    return (
      <div style={panelStyle}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            Page Design
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            color: '#A78659',
            background: 'rgba(167, 134, 89, 0.15)',
            padding: '2px 6px',
            borderRadius: '8px',
          }}>
            {page}
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          <PageDesignPanel
            pageDesign={pageDesign}
            onChange={onPageDesignChange}
          />
        </div>
      </div>
    )
  }

  /* ── Empty state: nothing selected ─────────────────────────────────── */
  if (!instanceId || !sectionConfig) {
    return (
      <div style={panelStyle}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✎</div>
            <div style={{ fontSize: '13px' }}>Select a section to edit</div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Section selected, no element → section panel + hint ────────────── */
  if (!selectedElement || !resolvedElement) {
    return (
      <div style={panelStyle}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              {sectionConfig.label}
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 500,
              color: status.color,
              background: status.color + '20',
              padding: '2px 6px',
              borderRadius: '8px',
            }}>
              {status.label}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {/* Enabled toggle */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#ccc',
            }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleEnabled(e.target.checked)}
                style={{ accentColor: 'var(--bronze, #A78659)' }}
              />
              <span>Enabled</span>
            </label>
          </div>

          {/* Variant selection */}
          {sectionKey && (() => {
            const variants = getVariantsForSection(sectionKey)
            if (variants.length === 0) return null
            const currentVariant = sectionData?.variant || variants[0]?.id
            return (
              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Layout Variant</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {variants.map(variant => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onVariantChange && onVariantChange(instanceId, variant.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        border: '1px solid',
                        borderColor: currentVariant === variant.id ? '#A78659' : '#333',
                        borderRadius: '6px',
                        background: currentVariant === variant.id ? 'rgba(167, 134, 89, 0.1)' : 'transparent',
                        color: currentVariant === variant.id ? '#A78659' : '#ccc',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        border: '2px solid',
                        borderColor: currentVariant === variant.id ? '#A78659' : '#555',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {currentVariant === variant.id && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A78659' }} />
                        )}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{variant.label}</div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{variant.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Section-level controls */}
          <SectionControls
            instanceId={instanceId}
            sectionStyleOverrides={resolveSectionOverrides(sectionStyleOverrides)}
            onSectionStyleChange={onSectionStyleChange}
          />

          {/* Hint text */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '6px',
            background: '#1a1a1a',
            border: '1px solid #333',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px', opacity: 0.4 }}>🖱</div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
              Select an element on the canvas to edit its properties
            </div>
          </div>
        </div>

        {/* Footer: Save / Publish / Discard */}
        <InspectorFooter
          onSave={onSave}
          onPublish={onPublish}
          onDiscard={onDiscard}
          saving={saving}
          hasDraft={hasDraft}
        />
      </div>
    )
  }

  /* ── Element selected → contextual element panel ───────────────────── */
  const el = resolvedElement

  // Element type icons
  const typeIcons = {
    text: 'T',
    image: '🖼',
    button: '→',
  }

  return (
    <div style={panelStyle}>
      {/* Header: section name + element label + type icon */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
          {sectionConfig.label}
        </div>
        <span style={{
          fontSize: '10px',
          color: '#888',
          background: '#333',
          padding: '2px 6px',
          borderRadius: '8px',
        }}>
          {el.label}
        </span>
        <span style={{
          fontSize: '10px',
          color: '#A78659',
          marginLeft: 'auto',
        }}>
          {typeIcons[el.type] || ''}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        {el.type === 'text' && (
          <>
            {/* CONTENT group — first group open by default */}
            <ControlGroup title="Content">
              <span style={LABEL_STYLE}>{el.label}</span>
              <textarea
                value={getFieldValue(sectionData, el.contentField)}
                onChange={(e) => onFieldChange(instanceId, el.contentField, e.target.value)}
                rows={3}
                style={{
                  ...TEXT_INPUT_STYLE,
                  minHeight: '60px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </ControlGroup>

            {el.capabilities.includes('typography') && (
              <TypographyControls
                elementKey={el.contentField}
                styleOverrides={resolvedStyleOverrides}
                onStyleChange={onStyleChange}
                instanceId={instanceId}
                defaultOpen={false}
              />
            )}

            {el.capabilities.includes('spacing') && (
              <SpacingControls
                elementKey={el.contentField}
                styleOverrides={resolvedStyleOverrides}
                onStyleChange={onStyleChange}
                instanceId={instanceId}
                defaultOpen={false}
              />
            )}
          </>
        )}

        {el.type === 'image' && (
          <ImageControls
            element={el}
            elementKey={el.contentField}
            instanceId={instanceId}
            sectionData={sectionData}
            styleOverrides={resolvedStyleOverrides}
            onStyleChange={onStyleChange}
            onFieldChange={onFieldChange}
            onOpenMedia={onOpenMedia}
            defaultOpen={true}
          />
        )}

        {el.type === 'button' && (
          <ButtonElementControls
            element={el}
            elementKey={el.contentField}
            instanceId={instanceId}
            sectionData={sectionData}
            styleOverrides={resolvedStyleOverrides}
            onStyleChange={onStyleChange}
            onFieldChange={onFieldChange}
            defaultOpen={true}
          />
        )}
      </div>

      {/* Footer: Save / Publish / Discard */}
      <InspectorFooter
        onSave={onSave}
        onPublish={onPublish}
        onDiscard={onDiscard}
        saving={saving}
        hasDraft={hasDraft}
      />
    </div>
  )
}

/* ── Footer (shared across all states) ─────────────────────────────────────── */

function InspectorFooter({ onSave, onPublish, onDiscard, saving, hasDraft }) {
  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid #333',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={{
          flex: 1,
          padding: '8px 12px',
          background: '#444',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          minWidth: '80px',
        }}
      >
        {saving ? '...' : 'Save Draft'}
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={saving}
        style={{
          flex: 1,
          padding: '8px 12px',
          background: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          minWidth: '80px',
        }}
      >
        Publish
      </button>
      {hasDraft && (
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          style={{
            width: '100%',
            padding: '6px 12px',
            background: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            marginTop: '4px',
          }}
        >
          Discard Draft
        </button>
      )}
    </div>
  )
}
