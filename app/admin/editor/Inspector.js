'use client'

import { useState, useEffect } from 'react'

function getStatus(section) {
  if (!section) return { label: 'Using fallback', color: '#6c757d' }
  const hasDraft = section.status === 'draft'
  if (hasDraft && section.enabled) return { label: 'Published + draft', color: '#e67e22' }
  if (hasDraft && !section.enabled) return { label: 'Draft changes', color: '#e67e22' }
  if (section.enabled) return { label: 'Published', color: '#28a745' }
  return { label: 'Disabled', color: '#dc3545' }
}

export default function Inspector({
  sectionKey,
  sectionData,
  sectionConfig,
  page,
  onFieldChange,
  onSave,
  onPublish,
  onDiscard,
  onOpenMedia,
  saving,
}) {
  const [localForm, setLocalForm] = useState({})
  
  useEffect(() => {
    if (sectionData) {
      const form = {}
      if (sectionConfig) {
        sectionConfig.editableFields.forEach(f => {
          // Prefer draft value when available, fall back to published
          const draftKey = 'draft' + f.key.charAt(0).toUpperCase() + f.key.slice(1)
          form[f.key] = sectionData[draftKey] ?? sectionData[f.key] ?? ''
        })
      }
      // Prefer draftEnabled when available
      form.enabled = sectionData.draftEnabled !== null && sectionData.draftEnabled !== undefined
        ? (sectionData.draftEnabled === 1 || sectionData.draftEnabled === true)
        : (sectionData.enabled === 1 || sectionData.enabled === true)
      setLocalForm(form)
    } else {
      setLocalForm({})
    }
  }, [sectionKey, sectionData, sectionConfig])
  
  function handleChange(fieldKey, value) {
    setLocalForm(prev => ({ ...prev, [fieldKey]: value }))
    onFieldChange(sectionKey, fieldKey, value)
  }
  
  function handleEnabledChange(checked) {
    setLocalForm(prev => ({ ...prev, enabled: checked }))
    onFieldChange(sectionKey, 'enabled', checked ? 1 : 0)
  }
  
  if (!sectionKey || !sectionConfig) {
    return (
      <div style={{
        width: '320px',
        background: '#222',
        borderLeft: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        flexShrink: 0,
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✎</div>
          <div style={{ fontSize: '13px' }}>Select a section to edit</div>
        </div>
      </div>
    )
  }
  
  const status = getStatus(sectionData)
  const hasDraft = sectionData?.status === 'draft'
  
  return (
    <div style={{
      width: '320px',
      background: '#222',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
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
              checked={localForm.enabled || false}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              style={{ accentColor: 'var(--bronze, #A78659)' }}
            />
            <span>Enabled</span>
          </label>
        </div>
        
        <div style={{ borderBottom: '1px solid #333', margin: '0 -16px 16px' }} />
        
        {sectionConfig.editableFields.map(field => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}>
              {field.label}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                value={localForm[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                maxLength={field.maxLength}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: '#2a2a2a',
                  color: '#fff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                value={localForm[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                maxLength={field.maxLength}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: '#2a2a2a',
                  color: '#fff',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            )}
            
            {field.type === 'image' && (
              <div>
                {localForm[field.key] && (
                  <div style={{
                    marginBottom: '8px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#2a2a2a',
                  }}>
                    <img
                      src={localForm[field.key]}
                      alt=""
                      style={{
                        width: '60px',
                        height: '45px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        background: '#333',
                      }}
                    />
                    <span style={{
                      fontSize: '11px',
                      color: '#888',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {localForm[field.key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChange(field.key, '')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={localForm[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder="URL or choose from media"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: '#2a2a2a',
                      color: '#fff',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenMedia(field.key)}
                    style={{
                      background: '#333',
                      color: '#ccc',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Media
                  </button>
                </div>
              </div>
            )}
            
            {field.type === 'boolean' && (
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
                  checked={!!localForm[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  style={{ accentColor: 'var(--bronze, #A78659)' }}
                />
                <span>Enable</span>
              </label>
            )}
            
            {field.maxLength && field.type !== 'boolean' && (
              <div style={{ 
                fontSize: '10px', 
                color: '#555', 
                marginTop: '4px',
                textAlign: 'right',
              }}>
                {(localForm[field.key] || '').length} / {field.maxLength}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <button
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
    </div>
  )
}
