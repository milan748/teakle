'use client'

import { getSectionConfig } from './sections/registry'

// Resolve draft values for display — prefers draft field when non-null, falls back to published
function getDisplayData(rawData) {
  if (!rawData) return null
  const display = { ...rawData }
  const fieldMap = {
    title: 'draftTitle',
    subtitle: 'draftSubtitle',
    eyebrow: 'draftEyebrow',
    body: 'draftBody',
    image: 'draftImage',
    mobileImage: 'draftMobileImage',
    buttonLabel: 'draftButtonLabel',
    buttonUrl: 'draftButtonUrl',
    enabled: 'draftEnabled',
  }
  for (const [baseKey, draftKey] of Object.entries(fieldMap)) {
    if (draftKey in display && display[draftKey] !== null && display[draftKey] !== undefined) {
      display[baseKey] = display[draftKey]
    }
  }
  return display
}

export default function Canvas({ sections, getSectionData, selectedSection, onSelectSection, viewMode, loading, page }) {
  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px',
      }}>
        Loading sections...
      </div>
    )
  }
  
  const canvasWidth = viewMode === 'mobile' ? '375px' : '100%'
  
  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      background: '#2a2a2a',
      display: 'flex',
      justifyContent: viewMode === 'mobile' ? 'center' : 'stretch',
      padding: viewMode === 'mobile' ? '20px 0' : '0',
    }}>
      <div style={{
        width: canvasWidth,
        maxWidth: viewMode === 'mobile' ? '375px' : 'none',
        background: '#F7F4EE',
        minHeight: '100%',
        position: 'relative',
        boxShadow: viewMode === 'mobile' ? '0 0 40px rgba(0,0,0,0.3)' : 'none',
      }}>
        {sections.map((key) => {
          const config = getSectionConfig(key, page)
          const data = getDisplayData(getSectionData(key))
          const isSelected = selectedSection === key
          
          if (!config) return null
          
          const SectionComponent = config.component
          
          return (
            <div
              key={key}
              onClick={(e) => {
                e.stopPropagation()
                onSelectSection(key)
              }}
              style={{
                position: 'relative',
                cursor: 'pointer',
                outline: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                outlineOffset: '-2px',
                transition: 'outline-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.outlineColor = 'rgba(59, 130, 246, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.outlineColor = 'transparent'
                }
              }}
            >
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                zIndex: 5,
                background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 500,
                padding: '3px 8px',
                borderRadius: '4px',
                pointerEvents: 'none',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.15s',
              }}
              className="section-label-badge"
              >
                {config.label}
              </div>
              
              <SectionComponent
                data={data}
                isSelected={isSelected}
                page={page}
              />
            </div>
          )
        })}
        
        {sections.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}>
            No sections found for this page.
          </div>
        )}
      </div>
      
      <style>{`
        div:hover > .section-label-badge { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
