'use client'

export default function EditorToolbar({ page, pageLabel, viewMode, onViewModeChange, message, saving, onBack, onUndo, onRedo, canUndo, canRedo, undoCount, redoCount, onSavePageTemplate, onPageDesign, showPageDesign }) {
  return (
    <div style={{
      height: '48px',
      background: '#1a1a1a',
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
        <button
          onClick={onBack}
          aria-label="Back to Admin"
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Back to Admin"
        >
          ←
        </button>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{pageLabel}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>Visual Editor</div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        background: '#2a2a2a',
        borderRadius: '6px',
        padding: '2px',
      }}>
        <button
          onClick={() => onViewModeChange('desktop')}
          aria-pressed={viewMode === 'desktop'}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            background: viewMode === 'desktop' ? '#444' : 'transparent',
            color: viewMode === 'desktop' ? '#fff' : '#888',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Desktop
        </button>
        <button
          onClick={() => onViewModeChange('tablet')}
          aria-pressed={viewMode === 'tablet'}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            background: viewMode === 'tablet' ? '#444' : 'transparent',
            color: viewMode === 'tablet' ? '#fff' : '#888',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Tablet
        </button>
        <button
          onClick={() => onViewModeChange('mobile')}
          aria-pressed={viewMode === 'mobile'}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            background: viewMode === 'mobile' ? '#444' : 'transparent',
            color: viewMode === 'mobile' ? '#fff' : '#888',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Mobile
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={`Undo${undoCount > 0 ? ` (${undoCount} available)` : ''}`}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            background: canUndo ? '#333' : 'transparent',
            color: canUndo ? '#fff' : '#555',
            cursor: canUndo ? 'pointer' : 'default',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title={`Undo (Ctrl+Z)${undoCount > 0 ? ` - ${undoCount} available` : ''}`}
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          aria-label={`Redo${redoCount > 0 ? ` (${redoCount} available)` : ''}`}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            background: canRedo ? '#333' : 'transparent',
            color: canRedo ? '#fff' : '#555',
            cursor: canRedo ? 'pointer' : 'default',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title={`Redo (Ctrl+Y)${redoCount > 0 ? ` - ${redoCount} available` : ''}`}
        >
          ↷
        </button>
        {onSavePageTemplate && (
          <button
            onClick={onSavePageTemplate}
            aria-label="Save Page as Template"
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px',
              background: '#333',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Save Page as Template"
          >
            💾 Template
          </button>
        )}
        {onPageDesign && (
          <button
            onClick={onPageDesign}
            aria-label="Page Design Settings"
            aria-pressed={showPageDesign}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px',
              background: showPageDesign ? '#A78659' : '#333',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Page Design Settings"
          >
            🎨 Design
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', justifyContent: 'flex-end' }}>
        {message.text && (
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: '12px',
              color: message.type === 'success' ? '#28a745' : '#dc3545',
              fontWeight: 500,
            }}
          >
            {message.text}
          </span>
        )}
        <a
          href={`/${page === 'home' ? '' : page}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', color: 'var(--bronze, #A78659)', textDecoration: 'none' }}
        >
          View live ↗
        </a>
      </div>
    </div>
  )
}
