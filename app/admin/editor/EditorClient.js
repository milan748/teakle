'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '@/lib/adminApi'
import { PAGE_SECTIONS, PAGE_LABELS, getSectionConfig } from './sections/registry'
import Canvas from './Canvas'
import Inspector from './Inspector'
import EditorToolbar from './EditorToolbar'
import MediaLibrary from '../MediaLibrary'

export default function EditorClient({ page }) {
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [viewMode, setViewMode] = useState('desktop')
  const [showMedia, setShowMedia] = useState(false)
  const [mediaTarget, setMediaTarget] = useState(null)
  
  const sectionKeys = PAGE_SECTIONS[page] || []
  const pageLabel = PAGE_LABELS[page] || page
  
  useEffect(() => {
    fetchSections()
  }, [page])
  
  async function fetchSections() {
    setLoading(true)
    try {
      const data = await adminFetch(`/api/admin/content/${page}`)
      if (data.success) setSections(data.data)
    } catch {
      setMessage({ text: 'Failed to load sections', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  function getSectionData(sectionKey) {
    return sections.find(s => s.sectionKey === sectionKey) || null
  }
  
  function updateSectionData(sectionKey, fieldKey, value) {
    setSections(prev => prev.map(s => {
      if (s.sectionKey !== sectionKey) return s
      // Update draft field when it exists in the schema, otherwise update the base field
      const draftKey = 'draft' + fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
      if (draftKey in s) {
        return { ...s, [draftKey]: value, status: 'draft' }
      }
      return { ...s, [fieldKey]: value }
    }))
  }
  
  async function saveDraft(sectionKey) {
    const section = getSectionData(sectionKey)
    if (!section) return
    
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const payload = {}
      const config = getSectionConfig(sectionKey, page)
      if (config) {
        config.editableFields.forEach(f => {
          // Read from draft field when it exists, fall back to base field
          const draftKey = 'draft' + f.key.charAt(0).toUpperCase() + f.key.slice(1)
          payload[f.key] = (draftKey in section ? section[draftKey] : section[f.key]) || ''
        })
      }
      // Read from draftEnabled when it exists
      const draftEnabled = section.draftEnabled !== null && section.draftEnabled !== undefined
        ? section.draftEnabled
        : section.enabled
      payload.enabled = draftEnabled === 1 || draftEnabled === true
      
      const data = await adminFetch(`/api/admin/content/${page}/${sectionKey}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.sectionKey === sectionKey ? data.data : s))
        setMessage({ text: 'Draft saved', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to save', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to save draft', type: 'error' })
    } finally {
      setSaving(false)
    }
  }
  
  async function publishSection(sectionKey) {
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${sectionKey}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish' }),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.sectionKey === sectionKey ? data.data : s))
        setMessage({ text: 'Published', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to publish', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to publish', type: 'error' })
    } finally {
      setSaving(false)
    }
  }
  
  async function discardDraft(sectionKey) {
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${sectionKey}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'discard' }),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.sectionKey === sectionKey ? data.data : s))
        setMessage({ text: 'Draft discarded', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to discard', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to discard', type: 'error' })
    } finally {
      setSaving(false)
    }
  }
  
  function handleMediaSelect(item) {
    if (mediaTarget) {
      updateSectionData(mediaTarget.sectionKey, mediaTarget.fieldKey, item.url)
      setShowMedia(false)
      setMediaTarget(null)
    }
  }
  
  function handleFieldChange(sectionKey, fieldKey, value) {
    updateSectionData(sectionKey, fieldKey, value)
  }
  
  const selectedData = selectedSection ? getSectionData(selectedSection) : null
  const selectedConfig = selectedSection ? getSectionConfig(selectedSection, page) : null
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: '#1a1a1a',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      {showMedia && (
        <MediaLibrary
          onSelect={handleMediaSelect}
          onClose={() => { setShowMedia(false); setMediaTarget(null) }}
        />
      )}
      
      <EditorToolbar
        page={page}
        pageLabel={pageLabel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        message={message}
        saving={saving}
        onBack={() => window.location.href = '/admin'}
      />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '240px',
          background: '#222',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #333',
            fontSize: '13px',
            fontWeight: 600,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Sections
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            {sectionKeys.map((key) => {
              const config = getSectionConfig(key, page)
              const data = getSectionData(key)
              const isActive = selectedSection === key
              const hasDraft = data?.status === 'draft'
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSection(key)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    marginBottom: '2px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: '6px',
                    background: isActive ? 'var(--bronze, #A78659)' : 'transparent',
                    color: isActive ? '#fff' : '#ccc',
                    fontWeight: isActive ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{config?.label || key}</span>
                    {hasDraft && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#e67e22',
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        <Canvas
          sections={sectionKeys}
          getSectionData={getSectionData}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          viewMode={viewMode}
          loading={loading}
          page={page}
        />
        
        <Inspector
          sectionKey={selectedSection}
          sectionData={selectedData}
          sectionConfig={selectedConfig}
          page={page}
          onFieldChange={handleFieldChange}
          onSave={() => selectedSection && saveDraft(selectedSection)}
          onPublish={() => selectedSection && publishSection(selectedSection)}
          onDiscard={() => selectedSection && discardDraft(selectedSection)}
          onOpenMedia={(fieldKey) => {
            setMediaTarget({ sectionKey: selectedSection, fieldKey })
            setShowMedia(true)
          }}
          saving={saving}
        />
      </div>
    </div>
  )
}
