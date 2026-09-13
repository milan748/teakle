'use client'

import { useState } from 'react'

const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 500,
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
  display: 'block',
}

function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
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

function ControlGroup({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: '2px' }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
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

export default function PageDesignPanel({ pageDesign = {}, onChange }) {
  const [tabletOverrides, setTabletOverrides] = useState(pageDesign.tablet || {})
  const [mobileOverrides, setMobileOverrides] = useState(pageDesign.mobile || {})
  
  function update(key, value) {
    onChange(key, value)
  }
  
  function updateTablet(key, value) {
    const next = { ...tabletOverrides, [key]: value }
    setTabletOverrides(next)
    onChange('tablet', next)
  }
  
  function updateMobile(key, value) {
    const next = { ...mobileOverrides, [key]: value }
    setMobileOverrides(next)
    onChange('mobile', next)
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Background */}
      <ControlGroup title="Background">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Preset</span>
          <PillGroup
            options={[
              { label: 'Default', value: 'default' },
              { label: 'Light', value: 'light' },
              { label: 'Warm', value: 'warm' },
              { label: 'Stone', value: 'stone' },
              { label: 'Dark', value: 'dark' },
            ]}
            value={pageDesign.background}
            onChange={(v) => update('background', v)}
          />
        </div>
      </ControlGroup>

      {/* Content Width */}
      <ControlGroup title="Content Width">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Width</span>
          <PillGroup
            options={[
              { label: 'Compact', value: '800px' },
              { label: 'Standard', value: '1200px' },
              { label: 'Wide', value: '1600px' },
            ]}
            value={pageDesign.contentWidth}
            onChange={(v) => update('contentWidth', v)}
          />
        </div>
      </ControlGroup>

      {/* Spacing */}
      <ControlGroup title="Spacing">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Section Spacing</span>
          <PillGroup
            options={[
              { label: 'Compact', value: 'compact' },
              { label: 'Standard', value: 'standard' },
              { label: 'Spacious', value: 'spacious' },
            ]}
            value={pageDesign.spacing}
            onChange={(v) => update('spacing', v)}
          />
        </div>
      </ControlGroup>

      {/* Typography */}
      <ControlGroup title="Typography">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Heading Scale</span>
          <PillGroup
            options={[
              { label: 'Conservative', value: 'conservative' },
              { label: 'Balanced', value: 'balanced' },
              { label: 'Expressive', value: 'expressive' },
            ]}
            value={pageDesign.typography}
            onChange={(v) => update('typography', v)}
          />
        </div>
      </ControlGroup>

      {/* Color Theme */}
      <ControlGroup title="Color Theme">
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Palette</span>
          <PillGroup
            options={[
              { label: 'Teakle', value: 'teakle' },
              { label: 'Monochrome', value: 'monochrome' },
              { label: 'Warm Accent', value: 'warm-accent' },
            ]}
            value={pageDesign.colorTheme}
            onChange={(v) => update('colorTheme', v)}
          />
        </div>
      </ControlGroup>

      {/* Tablet Overrides */}
      <ControlGroup title="Tablet Overrides" defaultOpen={false}>
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Content Width</span>
          <PillGroup
            options={[
              { label: 'Default', value: '' },
              { label: 'Compact', value: '800px' },
              { label: 'Standard', value: '1200px' },
            ]}
            value={tabletOverrides.contentWidth || ''}
            onChange={(v) => updateTablet('contentWidth', v || undefined)}
          />
        </div>
        <div>
          <span style={LABEL_STYLE}>Spacing</span>
          <PillGroup
            options={[
              { label: 'Default', value: '' },
              { label: 'Compact', value: 'compact' },
              { label: 'Standard', value: 'standard' },
            ]}
            value={tabletOverrides.spacing || ''}
            onChange={(v) => updateTablet('spacing', v || undefined)}
          />
        </div>
      </ControlGroup>

      {/* Mobile Overrides */}
      <ControlGroup title="Mobile Overrides" defaultOpen={false}>
        <div style={{ marginBottom: '10px' }}>
          <span style={LABEL_STYLE}>Content Width</span>
          <PillGroup
            options={[
              { label: 'Default', value: '' },
              { label: 'Compact', value: '800px' },
              { label: 'Standard', value: '1200px' },
            ]}
            value={mobileOverrides.contentWidth || ''}
            onChange={(v) => updateMobile('contentWidth', v || undefined)}
          />
        </div>
        <div>
          <span style={LABEL_STYLE}>Spacing</span>
          <PillGroup
            options={[
              { label: 'Default', value: '' },
              { label: 'Compact', value: 'compact' },
              { label: 'Standard', value: 'standard' },
            ]}
            value={mobileOverrides.spacing || ''}
            onChange={(v) => updateMobile('spacing', v || undefined)}
          />
        </div>
      </ControlGroup>

      {/* Info */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        borderRadius: '6px',
        background: '#1a1a1a',
        border: '1px solid #333',
        fontSize: '11px',
        color: '#666',
        lineHeight: 1.5,
      }}>
        Page design settings apply to all sections on this page. Section-level overrides take precedence.
      </div>
    </div>
  )
}
