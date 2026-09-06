'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FONT_SIZE_PRESETS, FONT_WEIGHT_PRESETS, LINE_HEIGHT_PRESETS,
  SPACING_TOKENS, ALIGNMENT_OPTIONS, IMAGE_FIT_OPTIONS,
  IMAGE_POSITION_OPTIONS, BUTTON_VARIANTS, BUTTON_SIZES
} from './sections/registry'

/* ── Helpers ───────────────────────────────────────────────────────────────── */

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

  return (
    <div style={{ marginBottom: '2px' }}>
      <button
        type="button"
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
      {open && (
        <div style={{ padding: '10px 0 6px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Typography Controls ───────────────────────────────────────────────────── */

function TypographyControls({ elementKey, styleOverrides, onStyleChange, sectionKey }) {
  const overrides = styleOverrides[elementKey] || {}

  const set = (prop, val) => onStyleChange(sectionKey, elementKey, prop, val)

  return (
    <ControlGroup title="Typography">
      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Size</span>
        <PillGroup
          options={FONT_SIZE_PRESETS}
          value={overrides.fontSize}
          onChange={(v) => set('fontSize', v)}
        />
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
        <span style={LABEL_STYLE}>Line Height</span>
        <PillGroup
          options={LINE_HEIGHT_PRESETS}
          value={overrides.lineHeight}
          onChange={(v) => set('lineHeight', v)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={LABEL_STYLE}>Letter Spacing</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min="-0.05"
            max="0.3"
            step="0.01"
            value={overrides.letterSpacing ?? ''}
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

function SpacingControls({ elementKey, styleOverrides, onStyleChange, sectionKey }) {
  const overrides = styleOverrides[elementKey] || {}
  const set = (prop, val) => onStyleChange(sectionKey, elementKey, prop, val)

  return (
    <ControlGroup title="Spacing">
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

/* ── Image Controls ────────────────────────────────────────────────────────── */

function ImageControls({ element, elementKey, sectionKey, sectionData, styleOverrides, onStyleChange, onFieldChange, onOpenMedia }) {
  const contentValue = sectionData?.[element.contentField] || ''
  const overrides = styleOverrides[elementKey] || {}
  const set = (prop, val) => onStyleChange(sectionKey, elementKey, prop, val)

  const positionOptions = IMAGE_POSITION_OPTIONS
  const hOptions = positionOptions.filter(o => ['left', 'center', 'right'].includes(o.value))
  const vOptions = positionOptions.filter(o => ['top', 'middle', 'bottom'].includes(o.value))

  return (
    <>
      <ControlGroup title="Image">
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
          onChange={(e) => onFieldChange(sectionKey, element.contentField, e.target.value)}
          style={TEXT_INPUT_STYLE}
        />
      </ControlGroup>

      {element.capabilities.includes('fit') && (
        <ControlGroup title="Fit">
          <span style={LABEL_STYLE}>Object Fit</span>
          <PillGroup
            options={IMAGE_FIT_OPTIONS}
            value={overrides.objectFit}
            onChange={(v) => set('objectFit', v)}
          />
        </ControlGroup>
      )}

      {element.capabilities.includes('position') && (
        <ControlGroup title="Position">
          <div style={{ marginBottom: '10px' }}>
            <span style={LABEL_STYLE}>Horizontal</span>
            <PillGroup
              options={hOptions}
              value={overrides.objectPositionX}
              onChange={(v) => set('objectPositionX', v)}
            />
          </div>
          <div>
            <span style={LABEL_STYLE}>Vertical</span>
            <PillGroup
              options={vOptions}
              value={overrides.objectPositionY}
              onChange={(v) => set('objectPositionY', v)}
            />
          </div>
        </ControlGroup>
      )}
    </>
  )
}

/* ── Button Element Controls ───────────────────────────────────────────────── */

function ButtonElementControls({ element, elementKey, sectionKey, sectionData, styleOverrides, onStyleChange, onFieldChange }) {
  const labelValue = sectionData?.[element.contentField] || ''
  const urlValue = sectionData?.[element.urlField] || ''
  const overrides = styleOverrides[elementKey] || {}
  const set = (prop, val) => onStyleChange(sectionKey, elementKey, prop, val)

  return (
    <>
      <ControlGroup title="Content">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Label</span>
          <input
            type="text"
            value={labelValue}
            onChange={(e) => onFieldChange(sectionKey, element.contentField, e.target.value)}
            style={TEXT_INPUT_STYLE}
          />
        </div>
        <div>
          <span style={LABEL_STYLE}>URL</span>
          <input
            type="text"
            value={urlValue}
            placeholder="https://..."
            onChange={(e) => onFieldChange(sectionKey, element.urlField, e.target.value)}
            style={TEXT_INPUT_STYLE}
          />
        </div>
      </ControlGroup>

      {element.capabilities.includes('variant') && (
        <ControlGroup title="Style">
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
        <ControlGroup title="Alignment">
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
  sectionKey,
  sectionData,
  sectionConfig,
  page,
  selectedElement,
  elements,
  styleOverrides = {},
  onFieldChange,
  onStyleChange,
  onSave,
  onPublish,
  onDiscard,
  onOpenMedia,
  saving,
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
    onFieldChange(sectionKey, 'enabled', checked ? 1 : 0)
  }, [sectionKey, onFieldChange])

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

  /* ── Empty state: nothing selected ─────────────────────────────────── */
  if (!sectionKey || !sectionConfig) {
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

  return (
    <div style={panelStyle}>
      {/* Header: section name + element label */}
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
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        {el.type === 'text' && (
          <>
            {/* CONTENT group */}
            <ControlGroup title="Content">
              <span style={LABEL_STYLE}>{el.label}</span>
              <textarea
                value={sectionData?.[el.contentField] || ''}
                onChange={(e) => onFieldChange(sectionKey, el.contentField, e.target.value)}
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
                styleOverrides={styleOverrides}
                onStyleChange={onStyleChange}
                sectionKey={sectionKey}
              />
            )}

            {el.capabilities.includes('spacing') && (
              <SpacingControls
                elementKey={el.contentField}
                styleOverrides={styleOverrides}
                onStyleChange={onStyleChange}
                sectionKey={sectionKey}
              />
            )}
          </>
        )}

        {el.type === 'image' && (
          <ImageControls
            element={el}
            elementKey={el.contentField}
            sectionKey={sectionKey}
            sectionData={sectionData}
            styleOverrides={styleOverrides}
            onStyleChange={onStyleChange}
            onFieldChange={onFieldChange}
            onOpenMedia={onOpenMedia}
          />
        )}

        {el.type === 'button' && (
          <ButtonElementControls
            element={el}
            elementKey={el.contentField}
            sectionKey={sectionKey}
            sectionData={sectionData}
            styleOverrides={styleOverrides}
            onStyleChange={onStyleChange}
            onFieldChange={onFieldChange}
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
