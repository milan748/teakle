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

export default function Canvas({ sections, selectedSection, onSelectSection, selectedElement = null, onSelectElement = () => {}, onUpdateField, viewMode, loading, page, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, draggedIndex, dragOverIndex }) {
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
      <div
        style={{
          width: canvasWidth,
          maxWidth: viewMode === 'mobile' ? '375px' : 'none',
          background: '#F7F4EE',
          minHeight: '100%',
          position: 'relative',
          boxShadow: viewMode === 'mobile' ? '0 0 40px rgba(0,0,0,0.3)' : 'none',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectSection(null)
            onSelectElement(null, null)
          }
        }}
      >
        {sections.map((section, index) => {
          const config = getSectionConfig(section.sectionKey, page)
          const rawData = section
          const data = getDisplayData(rawData)
          const isSelected = selectedSection === section.instanceId
          const isDragging = draggedIndex === index
          const showInsertBefore = dragOverIndex === index
          const showInsertAfter = dragOverIndex === index + 1 && index === sections.length - 1
          
          // Parse style overrides from raw data
          let sectionStyleOverrides = {}
          if (rawData) {
            try {
              sectionStyleOverrides = JSON.parse(rawData.draftStyleOverrides || rawData.styleOverrides || '{}') || {}
            } catch { sectionStyleOverrides = {} }
          }
          
          // Parse section-level style overrides
          let parsedSectionStyleOverrides = {}
          if (rawData) {
            try {
              parsedSectionStyleOverrides = JSON.parse(rawData.draftSectionStyleOverrides || rawData.sectionStyleOverrides || '{}') || {}
            } catch { parsedSectionStyleOverrides = {} }
          }
          
          if (!config) return null
          
          const SectionComponent = config.component
          
          return (
            <div key={section.instanceId}>
              {/* Insertion line indicator */}
              {(showInsertBefore || showInsertAfter) && (
                <div style={{
                  height: '3px',
                  background: '#3b82f6',
                  borderRadius: '2px',
                  margin: '0 8px',
                  boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)',
                }} />
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectSection(section.instanceId)
                  onSelectElement(section.instanceId, null)
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  outline: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                  outlineOffset: '-2px',
                  transition: 'outline-color 0.15s, opacity 0.15s',
                  opacity: isDragging ? 0.4 : 1,
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
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  const rect = e.currentTarget.getBoundingClientRect()
                  const midY = rect.top + rect.height / 2
                  const insertIndex = e.clientY < midY ? index : index + 1
                  onDragOver?.(e, insertIndex, true)
                }}
                onDragLeave={(e) => {
                  onDragLeave?.(e)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
                  if (isNaN(fromIndex)) {
                    onDragLeave?.(e)
                    return
                  }
                  const rect = e.currentTarget.getBoundingClientRect()
                  const midY = rect.top + rect.height / 2
                  let toIndex = e.clientY < midY ? index : index + 1
                  if (fromIndex < toIndex) toIndex--
                  onDrop?.(e, fromIndex, toIndex, true)
                }}
              >
                {/* Drag handle */}
                <div
                  draggable="true"
                  onDragStart={(e) => onDragStart?.(e, index)}
                  onDragEnd={onDragEnd}
                  className="canvas-drag-handle"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 6,
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    borderRadius: '4px',
                    cursor: 'grab',
                    fontSize: '14px',
                    lineHeight: 1,
                    userSelect: 'none',
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.15s, background 0.15s',
                  }}
                  title="Drag to reorder"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ⠿
                </div>

                {/* Section label badge */}
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
                  sectionKey={section.sectionKey}
                  data={data}
                  isSelected={isSelected}
                  selectedElement={isSelected ? selectedElement : null}
                  onSelectElement={(elementKey) => onSelectElement(section.instanceId, elementKey)}
                  onUpdateField={onUpdateField}
                  styleOverrides={sectionStyleOverrides}
                  sectionStyleOverrides={parsedSectionStyleOverrides}
                  viewMode={viewMode}
                  page={page}
                />
              </div>
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
        div:hover > .canvas-drag-handle { opacity: 1 !important; }
        .canvas-drag-handle:hover { background: #3b82f6 !important; }
        .canvas-drag-handle:active { cursor: grabbing !important; }
        .element-label-badge {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background: #10b981;
          color: #fff;
          fontSize: '10px';
          fontWeight: 600;
          padding: '2px 6px';
          borderRadius: '3px';
          pointerEvents: 'none';
          whiteSpace: 'nowrap';
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)';
        }
        /* Focus-visible for keyboard navigation */
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        :focus:not(:focus-visible) {
          outline: none;
        }
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
