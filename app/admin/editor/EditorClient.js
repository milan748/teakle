'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { adminFetch } from '@/lib/adminApi'
import { PAGE_LABELS, SECTION_REGISTRY, PAGE_SECTIONS, getSectionConfig, getElementsForSection } from './sections/registry'
import Canvas from './Canvas'
import Inspector from './Inspector'
import EditorToolbar from './EditorToolbar'
import FloatingToolbar from './FloatingToolbar'
import MediaLibrary from '../MediaLibrary'

// Generate a random 8-char alphanumeric string for instanceId
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Focus management hook for modals: saves trigger element, moves focus into modal, restores on close
function useModalFocus(isOpen) {
  const triggerRef = useRef(null)
  const modalRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element to restore later
      triggerRef.current = document.activeElement
      // Move focus into the modal after render
      requestAnimationFrame(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (firstFocusable) firstFocusable.focus()
          else modalRef.current.focus()
        }
      })
    } else if (triggerRef.current) {
      // Restore focus to the trigger element
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [isOpen])
  
  return modalRef
}

export default function EditorClient({ page }) {
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null) // now stores instanceId
  const [selectedElement, setSelectedElement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [viewMode, setViewMode] = useState('desktop')
  const [showMedia, setShowMedia] = useState(false)
  const [mediaTarget, setMediaTarget] = useState(null)
  const canvasContainerRef = useRef(null)
  const sectionListRef = useRef(null)

  // Undo/redo history stack
  const [history, setHistory] = useState({ past: [], present: [], future: [] })
  const lastPushTimeRef = useRef(0)

  // Section panel UI state
  const [contextMenu, setContextMenu] = useState(null) // { instanceId, x, y }
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { instanceId, label }
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState(null) // index for insertion line
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  // Template state
  const [sectionTemplates, setSectionTemplates] = useState([])
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [saveTemplateTarget, setSaveTemplateTarget] = useState(null) // { instanceId }
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  
  // Page template state
  const [showSavePageTemplateModal, setShowSavePageTemplateModal] = useState(false)
  const [pageTemplateName, setPageTemplateName] = useState('')
  const [pageTemplateDescription, setPageTemplateDescription] = useState('')
  
  // Page design state
  const [pageDesign, setPageDesign] = useState({})
  const [showPageDesign, setShowPageDesign] = useState(false)
  
  const pageLabel = PAGE_LABELS[page] || page
  
  // Modal focus management
  const deleteModalRef = useModalFocus(!!deleteConfirm)
  const addModalRef = useModalFocus(showAddModal)
  const saveTemplateModalRef = useModalFocus(showSaveTemplateModal)
  const savePageTemplateModalRef = useModalFocus(showSavePageTemplateModal)
  
  // Push current sections to history before making changes (deep clone to prevent reference corruption)
  function pushHistory(coalesce = false) {
    const now = Date.now()
    if (coalesce && now - lastPushTimeRef.current < 500) {
      return // Skip if rapid edits within 500ms
    }
    lastPushTimeRef.current = now
    const snapshot = JSON.parse(JSON.stringify(history.present))
    setHistory(prev => ({
      past: [...prev.past, snapshot].slice(-50), // keep last 50 snapshots max
      present: prev.present,
      future: [],
    }))
  }
  
  // Undo function
  function undo() {
    if (history.past.length === 0) return
    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)
    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    })
    setSections(previous)
  }

  // Redo function
  function redo() {
    if (history.future.length === 0) return
    const next = history.future[0]
    const newFuture = history.future.slice(1)
    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    })
    setSections(next)
  }

  useEffect(() => {
    fetchSections()
    fetchSectionTemplates()
    fetchPageDesign()
    setSelectedElement(null)
    setSelectedSection(null)
    setShowPageDesign(false)
  }, [page])
  
  async function fetchSections() {
    setLoading(true)
    try {
      const data = await adminFetch(`/api/admin/content/${page}`)
      if (data.success) {
        const fetchedSections = data.data || []
        setSections(fetchedSections)
        setHistory({ past: [], present: fetchedSections, future: [] })
      }
    } catch {
      setMessage({ text: 'Failed to load sections', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchSectionTemplates() {
    try {
      const data = await adminFetch('/api/admin/templates/sections')
      if (data.success) {
        setSectionTemplates(data.data || [])
      }
    } catch {
      // Non-critical, templates are optional
    }
  }
  
  async function fetchPageDesign() {
    try {
      const data = await adminFetch(`/api/admin/pages/${page}/design`)
      if (data.success) {
        setPageDesign(data.data || {})
      }
    } catch {
      // Non-critical, page design is optional
    }
  }
  
  const pageDesignSaveTimerRef = useRef(null)
  async function handlePageDesignChange(property, value) {
    const next = { ...pageDesign, [property]: value }
    setPageDesign(next)
    // Debounce API calls — save after 500ms of inactivity
    if (pageDesignSaveTimerRef.current) clearTimeout(pageDesignSaveTimerRef.current)
    pageDesignSaveTimerRef.current = setTimeout(async () => {
      try {
        await adminFetch(`/api/admin/pages/${page}/design`, {
          method: 'PUT',
          body: JSON.stringify(next),
        })
      } catch {
        setMessage({ text: 'Failed to save page design', type: 'error' })
      }
    }, 500)
  }
  
  function getSectionDataByInstanceId(instanceId) {
    return sections.find(s => s.instanceId === instanceId) || null
  }
  
  function getSectionData(sectionKey) {
    // Backward compatibility: find by sectionKey (first match)
    return sections.find(s => s.sectionKey === sectionKey) || null
  }
  
  function handleSelectElement(instanceId, elementKey) {
    if (elementKey) {
      setSelectedElement({ instanceId, elementKey })
      setSelectedSection(instanceId)
    } else {
      setSelectedElement(null)
      setSelectedSection(instanceId)
    }
  }
  
  // ── Section Operations ───────────────────────────────────────────────
  
  async function handleAddSection(sectionKey) {
    const instanceId = generateId()
    pushHistory()
    try {
      const data = await adminFetch(`/api/admin/content/${page}/sections`, {
        method: 'POST',
        body: JSON.stringify({ sectionKey, instanceId, sortOrder: sections.length }),
      })
      if (data.success) {
        setSections(prev => {
          const next = [...prev, data.data]
          setHistory(h => ({ ...h, present: next }))
          return next
        })
        setSelectedSection(instanceId)
        setMessage({ text: 'Section added', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to add section', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to add section', type: 'error' })
    }
  }
  
  async function handleDeleteSection(instanceId) {
    pushHistory()
    try {
      const data = await adminFetch(`/api/admin/content/${page}/sections`, {
        method: 'DELETE',
        body: JSON.stringify({ instanceId }),
      })
      if (data.success) {
        const deletedIndex = sections.findIndex(s => s.instanceId === instanceId)
        setSections(prev => {
          const next = prev.filter(s => s.instanceId !== instanceId)
          setHistory(h => ({ ...h, present: next }))
          // Select nearest remaining section after delete
          if (selectedSection === instanceId) {
            if (next.length > 0) {
              const newIdx = Math.min(deletedIndex, next.length - 1)
              setSelectedSection(next[newIdx].instanceId)
              setSelectedElement(null)
            } else {
              setSelectedSection(null)
              setSelectedElement(null)
            }
          }
          return next
        })
        setMessage({ text: 'Section deleted', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to delete section', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to delete section', type: 'error' })
    }
  }
  
  async function handleDuplicateSection(instanceId) {
    const newInstanceId = generateId()
    pushHistory()
    try {
      const data = await adminFetch(`/api/admin/content/${page}/sections`, {
        method: 'POST',
        body: JSON.stringify({ sectionKey: '_duplicate', instanceId: newInstanceId, sourceInstanceId: instanceId }),
      })
      if (data.success) {
        // The API returns the new section; insert it after the original
        setSections(prev => {
          const idx = prev.findIndex(s => s.instanceId === instanceId)
          const next = [...prev]
          next.splice(idx + 1, 0, data.data)
          setHistory(h => ({ ...h, present: next }))
          return next
        })
        setSelectedSection(newInstanceId)
        setMessage({ text: 'Section duplicated', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to duplicate section', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to duplicate section', type: 'error' })
    }
  }
  
  async function handleReorderSections(orderedIds) {
    pushHistory()
    try {
      const data = await adminFetch(`/api/admin/content/${page}/sections`, {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      })
      if (data.success) {
        setSections(prev => {
          const next = data.data
          setHistory(h => ({ ...h, present: next }))
          return next
        })
      } else {
        setMessage({ text: data.error || 'Failed to reorder sections', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to reorder sections', type: 'error' })
    }
  }

  // ── Move Section Up/Down ─────────────────────────────────────────────

  function handleMoveSection(instanceId, direction) {
    const idx = sections.findIndex(s => s.instanceId === instanceId)
    if (idx === -1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= sections.length) return
    const ids = sections.map(s => s.instanceId)
    const [moved] = ids.splice(idx, 1)
    ids.splice(newIdx, 0, moved)
    handleReorderSections(ids)
  }

  // ── Template Operations ──────────────────────────────────────────────

  async function handleSaveAsTemplate(instanceId) {
    const section = sections.find(s => s.instanceId === instanceId)
    if (!section) return

    setSaveTemplateTarget({ instanceId })
    setTemplateName(`${section.sectionKey} Template`)
    setTemplateDescription('')
    setShowSaveTemplateModal(true)
  }

  async function confirmSaveTemplate() {
    if (!saveTemplateTarget || !templateName.trim()) return

    const section = sections.find(s => s.instanceId === saveTemplateTarget.instanceId)
    if (!section) return

    try {
      const data = await adminFetch('/api/admin/templates/sections', {
        method: 'POST',
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDescription,
          sectionType: section.sectionKey,
          content: {
            title: section.title,
            subtitle: section.subtitle,
            eyebrow: section.eyebrow,
            body: section.body,
            image: section.image,
            mobileImage: section.mobileImage,
            buttonLabel: section.buttonLabel,
            buttonUrl: section.buttonUrl,
          },
          styleOverrides: section.styleOverrides ? JSON.parse(section.styleOverrides) : {},
          mobileOverrides: section.sectionStyleOverrides ? JSON.parse(section.sectionStyleOverrides) : {},
          variant: section.variant,
        }),
      })
      if (data.success) {
        setSectionTemplates(prev => [...prev, data.data])
        setMessage({ text: 'Template saved', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to save template', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to save template', type: 'error' })
    }

    setShowSaveTemplateModal(false)
    setSaveTemplateTarget(null)
    setTemplateName('')
    setTemplateDescription('')
  }

  async function handleInstantiateTemplate(templateId) {
    const instanceId = generateId()
    pushHistory()
    try {
      const data = await adminFetch(`/api/admin/templates/sections/${templateId}`, {
        method: 'POST',
        body: JSON.stringify({ page, instanceId, sortOrder: sections.length }),
      })
      if (data.success) {
        setSections(prev => {
          const next = [...prev, data.data]
          setHistory(h => ({ ...h, present: next }))
          return next
        })
        setSelectedSection(instanceId)
        setShowAddModal(false)
        setMessage({ text: 'Template inserted', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to insert template', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to insert template', type: 'error' })
    }
  }

  async function handleDeleteTemplate(templateId) {
    try {
      const data = await adminFetch('/api/admin/templates/sections', {
        method: 'DELETE',
        body: JSON.stringify({ id: templateId }),
      })
      if (data.success) {
        setSectionTemplates(prev => prev.filter(t => t.id !== templateId))
        setMessage({ text: 'Template deleted', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to delete template', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to delete template', type: 'error' })
    }
  }

  // ── Page Template Operations ─────────────────────────────────────────────

  function handleSavePageAsTemplate() {
    setPageTemplateName(`${pageLabel} Template`)
    setPageTemplateDescription('')
    setShowSavePageTemplateModal(true)
  }

  async function confirmSavePageTemplate() {
    if (!pageTemplateName.trim()) return

    try {
      // Capture current sections as template data
      const templateSections = sections.map(s => ({
        sectionType: s.sectionKey,
        variant: s.variant,
        content: {
          title: s.title,
          subtitle: s.subtitle,
          eyebrow: s.eyebrow,
          body: s.body,
          image: s.image,
          mobileImage: s.mobileImage,
          buttonLabel: s.buttonLabel,
          buttonUrl: s.buttonUrl,
        },
        styleOverrides: s.styleOverrides ? JSON.parse(s.styleOverrides) : {},
        mobileOverrides: s.sectionStyleOverrides ? JSON.parse(s.sectionStyleOverrides) : {},
      }))

      const data = await adminFetch('/api/admin/templates/pages', {
        method: 'POST',
        body: JSON.stringify({
          name: pageTemplateName.trim(),
          description: pageTemplateDescription,
          sections: templateSections,
          pageDesign: {},
        }),
      })
      if (data.success) {
        setMessage({ text: 'Page template saved', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to save page template', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Failed to save page template', type: 'error' })
    }

    setShowSavePageTemplateModal(false)
    setPageTemplateName('')
    setPageTemplateDescription('')
  }

  // ── Drag & Drop Handlers ──────────────────────────────────────────────

  function handleDragStart(e, index) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    setDraggedIndex(index)
    // Set a drag image using the element itself
    if (e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
    }
  }

  function handleDragOver(e, indexOrInsertIndex, isCanvasDrop) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (isCanvasDrop) {
      // Canvas already calculated the insert index
      setDragOverIndex(indexOrInsertIndex)
    } else {
      // Sidebar: calculate insert index from mouse position
      const rect = e.currentTarget.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const insertIndex = e.clientY < midY ? indexOrInsertIndex : indexOrInsertIndex + 1
      setDragOverIndex(insertIndex)
    }
  }

  function handleDragLeave() {
    setDragOverIndex(null)
  }

  function handleDrop(e, fromIndexOrSectionIndex, toIndexOrUndefined, isCanvasDrop) {
    e.preventDefault()
    let fromIndex, toIndex
    if (isCanvasDrop) {
      // Canvas already calculated both indices
      fromIndex = fromIndexOrSectionIndex
      toIndex = toIndexOrUndefined
    } else {
      // Sidebar: calculate from mouse position
      fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
      if (isNaN(fromIndex) || fromIndex === fromIndexOrSectionIndex) {
        setDragOverIndex(null)
        setDraggedIndex(null)
        return
      }
      const rect = e.currentTarget.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      toIndex = e.clientY < midY ? fromIndexOrSectionIndex : fromIndexOrSectionIndex + 1
      if (fromIndex < toIndex) toIndex--
    }
    const ids = sections.map(s => s.instanceId)
    const [moved] = ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, moved)
    setDragOverIndex(null)
    setDraggedIndex(null)
    handleReorderSections(ids)
  }

  function handleDragEnd() {
    setDragOverIndex(null)
    setDraggedIndex(null)
  }

  // ── Keyboard Navigation ───────────────────────────────────────────────

  function handleSectionListKeyDown(e) {
    if (!sections.length) return
    const count = sections.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => {
        const next = Math.min(prev + 1, count - 1)
        // Auto-select the section
        setSelectedSection(sections[next].instanceId)
        setSelectedElement(null)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => {
        const next = Math.max(prev - 1, 0)
        setSelectedSection(sections[next].instanceId)
        setSelectedElement(null)
        return next
      })
    } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < count) {
      e.preventDefault()
      const sec = sections[focusedIndex]
      setSelectedSection(sec.instanceId)
      const els = getElementsForSection(sec.sectionKey, page)
      if (els && els.length > 0) {
        setSelectedElement({ instanceId: sec.instanceId, elementKey: els[0].contentField })
      } else {
        setSelectedElement(null)
      }
    } else if (e.key === 'Delete' && focusedIndex >= 0 && focusedIndex < count) {
      e.preventDefault()
      const sec = sections[focusedIndex]
      const cfg = getSectionConfig(sec.sectionKey, page)
      setDeleteConfirm({ instanceId: sec.instanceId, label: cfg?.label || sec.sectionKey })
    } else if (e.key === 'd' && (e.ctrlKey || e.metaKey) && focusedIndex >= 0 && focusedIndex < count) {
      e.preventDefault()
      handleDuplicateSection(sections[focusedIndex].instanceId)
    } else if (e.key === 'Escape') {
      setContextMenu(null)
      setDeleteConfirm(null)
      setShowAddModal(false)
    }
  }

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function close() { setContextMenu(null) }
    // Delay to avoid the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', close)
      document.addEventListener('contextmenu', close)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', close)
      document.removeEventListener('contextmenu', close)
    }
  }, [contextMenu])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't intercept shortcuts when typing in inputs/textareas/contentEditable
      const tag = e.target?.tagName
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
        || e.target?.isContentEditable
      if (isEditable) return

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey
      
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
      } else if (ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
      } else if (e.key === 'Escape') {
        // Close any open overlay
        if (contextMenu) setContextMenu(null)
        else if (deleteConfirm) setDeleteConfirm(null)
        else if (showAddModal) setShowAddModal(false)
        else if (showSaveTemplateModal) setShowSaveTemplateModal(false)
        else if (showSavePageTemplateModal) setShowSavePageTemplateModal(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [history])

  function handleStyleChange(instanceId, elementKey, property, value) {
    pushHistory(true) // Coalesce rapid style changes
    setSections(prev => {
      const next = prev.map(s => {
        if (s.instanceId !== instanceId) return s
        const currentRaw = s.draftStyleOverrides || s.styleOverrides || '{}'
        let overrides
        try { overrides = JSON.parse(currentRaw) || {} } catch { overrides = {} }
        if (!overrides[elementKey]) overrides[elementKey] = {}
        
        // Mobile overrides: store under .mobile subkey
        if (viewMode === 'mobile') {
          if (!overrides[elementKey].mobile) overrides[elementKey].mobile = {}
          overrides[elementKey].mobile[property] = value
        } else {
          overrides[elementKey][property] = value
        }
        
        const newJson = JSON.stringify(overrides)
        return { ...s, draftStyleOverrides: newJson, status: 'draft' }
      })
      setHistory(h => ({ ...h, present: next }))
      return next
    })
  }

  function handleSectionStyleChange(instanceId, property, value) {
    pushHistory(true) // Coalesce rapid style changes
    setSections(prev => {
      const next = prev.map(s => {
        if (s.instanceId !== instanceId) return s
        const currentRaw = s.draftSectionStyleOverrides || s.sectionStyleOverrides || '{}'
        let overrides
        try { overrides = JSON.parse(currentRaw) || {} } catch { overrides = {} }
        overrides[property] = value
        const newJson = JSON.stringify(overrides)
        return { ...s, draftSectionStyleOverrides: newJson, status: 'draft' }
      })
      setHistory(h => ({ ...h, present: next }))
      return next
    })
  }

  function handleVariantChange(instanceId, variant) {
    pushHistory()
    setSections(prev => {
      const next = prev.map(s => {
        if (s.instanceId !== instanceId) return s
        return { ...s, variant, status: 'draft' }
      })
      setHistory(h => ({ ...h, present: next }))
      return next
    })
  }

  function updateSectionData(instanceId, fieldKey, value) {
    pushHistory(true) // Coalesce rapid text edits
    setSections(prev => {
      const next = prev.map(s => {
        if (s.instanceId !== instanceId) return s
        // Update draft field when it exists in the schema, otherwise update the base field
        const draftKey = 'draft' + fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
        if (draftKey in s) {
          return { ...s, [draftKey]: value, status: 'draft' }
        }
        return { ...s, [fieldKey]: value }
      })
      setHistory(h => ({ ...h, present: next }))
      return next
    })
  }
  
  async function saveDraft(instanceId) {
    const section = getSectionDataByInstanceId(instanceId)
    if (!section) return
    
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const payload = {}
      const config = getSectionConfig(section.sectionKey, page)
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
      payload.styleOverrides = section.draftStyleOverrides || section.styleOverrides || null
      payload.sectionStyleOverrides = section.draftSectionStyleOverrides || section.sectionStyleOverrides || null
      payload.variant = section.variant || null
      payload.instanceId = instanceId
      
      const data = await adminFetch(`/api/admin/content/${page}/${section.sectionKey}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.instanceId === instanceId ? data.data : s))
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
  
  async function publishSection(instanceId) {
    const section = getSectionDataByInstanceId(instanceId)
    if (!section) return
    
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${section.sectionKey}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish', instanceId }),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.instanceId === instanceId ? data.data : s))
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
  
  async function discardDraft(instanceId) {
    const section = getSectionDataByInstanceId(instanceId)
    if (!section) return
    
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${section.sectionKey}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'discard', instanceId }),
      })
      if (data.success) {
        setSections(prev => prev.map(s => s.instanceId === instanceId ? data.data : s))
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
      if (mediaTarget.fieldKey.includes(':')) {
        const [elementKey, fieldKey] = mediaTarget.fieldKey.split(':')
        handleFieldChange(mediaTarget.instanceId, fieldKey, item.url)
      } else {
        updateSectionData(mediaTarget.instanceId, mediaTarget.fieldKey, item.url)
      }
      setShowMedia(false)
      setMediaTarget(null)
    }
  }
  
  function handleFieldChange(instanceId, fieldKey, value) {
    updateSectionData(instanceId, fieldKey, value)
  }
  
  // Look up section data by the selected instanceId
  const selectedData = selectedSection ? getSectionDataByInstanceId(selectedSection) : null
  const selectedConfig = selectedData ? getSectionConfig(selectedData.sectionKey, page) : null
  
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
      <style>{`
        /* Responsive editor layout */
        @media (max-width: 768px) {
          .editor-main-layout { flex-direction: column !important; }
          .editor-section-list { width: 100% !important; max-height: 40vh !important; border-right: none !important; border-bottom: 1px solid #333 !important; }
          .editor-inspector { width: 100% !important; border-left: none !important; border-top: 1px solid #333 !important; }
          .editor-canvas-area { min-height: 300px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .editor-section-list { width: 200px !important; }
          .editor-inspector { width: 280px !important; }
        }
      `}</style>
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
        onUndo={undo}
        onRedo={redo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        undoCount={history.past.length}
        redoCount={history.future.length}
        onSavePageTemplate={handleSavePageAsTemplate}
        onPageDesign={() => {
          setShowPageDesign(prev => !prev)
          setSelectedSection(null)
          setSelectedElement(null)
        }}
        showPageDesign={showPageDesign}
      />
      
      <div className="editor-main-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left Panel: Section Management ─────────────────────────── */}
        <div className="editor-section-list" style={{
          width: '240px',
          background: '#222',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Header */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Sections
            </span>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {sections.length}
            </span>
          </div>

          {/* Section List */}
          <div
            ref={sectionListRef}
            style={{ flex: 1, overflow: 'auto', padding: '8px' }}
            onKeyDown={handleSectionListKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label="Page sections"
          >
            {sections.map((section, index) => {
              const config = getSectionConfig(section.sectionKey, page)
              const isActive = selectedSection === section.instanceId
              const hasDraft = section.status === 'draft'
              const isDragging = draggedIndex === index
              const showInsertBefore = dragOverIndex === index
              const showInsertAfter = dragOverIndex === index + 1 && index === sections.length - 1
              
              return (
                <div key={section.instanceId}>
                  {/* Insertion line indicator */}
                  {(showInsertBefore || showInsertAfter) && (
                    <div style={{
                      height: '2px',
                      background: 'var(--bronze, #A78659)',
                      borderRadius: '1px',
                      margin: '0 4px 2px',
                    }} />
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 8px 10px 4px',
                      marginBottom: '2px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--bronze, #A78659)' : 'transparent',
                      color: isActive ? '#fff' : '#ccc',
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'background 0.15s, opacity 0.15s',
                      opacity: isDragging ? 0.4 : 1,
                    }}
                    role="option"
                    aria-selected={isActive}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setSelectedSection(section.instanceId)
                      setFocusedIndex(index)
                      setShowPageDesign(false)
                      const els = getElementsForSection(section.sectionKey, page)
                      if (els && els.length > 0) {
                        setSelectedElement({ instanceId: section.instanceId, elementKey: els[0].contentField })
                      } else {
                        setSelectedElement(null)
                      }
                    }}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    {/* Drag handle */}
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? 'rgba(255,255,255,0.5)' : '#666',
                        cursor: 'grab',
                        fontSize: '14px',
                        flexShrink: 0,
                        borderRadius: '3px',
                        userSelect: 'none',
                      }}
                      title="Drag to reorder"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      ⠿
                    </span>

                    {/* Section info */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      minWidth: 0,
                      flex: 1,
                      marginLeft: '4px',
                    }}>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                      }}>
                        {config?.label || section.sectionKey}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        color: isActive ? 'rgba(255,255,255,0.6)' : '#888',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {section.sectionKey}
                      </span>
                    </div>

                    {/* Draft indicator */}
                    {hasDraft && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#e67e22',
                        flexShrink: 0,
                        marginRight: '4px',
                      }} />
                    )}

                    {/* Three-dot menu button */}
                    <button
                      type="button"
                      aria-label={`Actions for ${config?.label || section.sectionKey}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setContextMenu({
                          instanceId: section.instanceId,
                          index,
                          x: rect.right + 4,
                          y: rect.top,
                          label: config?.label || section.sectionKey,
                        })
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        color: isActive ? 'rgba(255,255,255,0.7)' : '#999',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Section actions"
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {sections.length === 0 && (
              <div style={{
                padding: '20px 12px',
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
              }}>
                No sections yet. Click + to add one.
              </div>
            )}
          </div>

          {/* Add Section Button */}
          <div style={{ padding: '8px', borderTop: '1px solid #333' }}>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '10px 12px',
                border: '1px dashed #444',
                borderRadius: '6px',
                background: 'transparent',
                color: '#999',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#ccc' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#999' }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
              Add Section
            </button>
          </div>
        </div>

        {/* ── Context Menu (positioned absolutely) ───────────────────── */}
        {contextMenu && (() => {
          const idx = contextMenu.index
          const canMoveUp = idx > 0
          const canMoveDown = idx < sections.length - 1
          const menuWidth = 180
          const menuHeight = 160
          // Clamp position to viewport
          const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 8)
          const y = Math.min(contextMenu.y, window.innerHeight - menuHeight - 8)
          return (
            <div
              role="menu"
              aria-label={`Actions for ${contextMenu.label}`}
              style={{
                position: 'fixed',
                left: x,
                top: y,
                width: menuWidth,
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 1000,
                padding: '4px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleDuplicateSection(contextMenu.instanceId)
                  setContextMenu(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#ccc',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '12px' }} aria-hidden="true">⧉</span>
                Duplicate
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDeleteConfirm({ instanceId: contextMenu.instanceId, label: contextMenu.label })
                  setContextMenu(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#dc3545',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,53,69,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '12px' }} aria-hidden="true">✕</span>
                Delete
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleSaveAsTemplate(contextMenu.instanceId)
                  setContextMenu(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#ccc',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '12px' }} aria-hidden="true">💾</span>
                Save as Template
              </button>
              <div style={{ height: '1px', background: '#444', margin: '4px 8px' }} role="separator" />
              <button
                type="button"
                role="menuitem"
                disabled={!canMoveUp}
                onClick={() => { handleMoveSection(contextMenu.instanceId, 'up'); setContextMenu(null) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: canMoveUp ? '#ccc' : '#555',
                  fontSize: '13px',
                  cursor: canMoveUp ? 'pointer' : 'default',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (canMoveUp) e.currentTarget.style.background = '#333' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '12px' }} aria-hidden="true">↑</span>
                Move Up
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!canMoveDown}
                onClick={() => { handleMoveSection(contextMenu.instanceId, 'down'); setContextMenu(null) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: canMoveDown ? '#ccc' : '#555',
                  fontSize: '13px',
                  cursor: canMoveDown ? 'pointer' : 'default',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (canMoveDown) e.currentTarget.style.background = '#333' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '12px' }} aria-hidden="true">↓</span>
                Move Down
              </button>
            </div>
          )
        })()}

        {/* ── Delete Confirmation Dialog ─────────────────────────────── */}
        {deleteConfirm && (
          <div
            ref={deleteModalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Delete ${deleteConfirm.label}`}
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') setDeleteConfirm(null) }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              zIndex: 2000,
              outline: 'none',
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              style={{
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '12px',
                padding: '24px',
                width: '340px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                Delete &ldquo;{deleteConfirm.label}&rdquo;?
              </div>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '20px', lineHeight: '1.5' }}>
                This action can be undone with Ctrl+Z.
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#ccc',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteSection(deleteConfirm.instanceId)
                    setDeleteConfirm(null)
                  }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#dc3545',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Section Modal ──────────────────────────────────────── */}
        {showAddModal && (() => {
          const pageSectionKeys = PAGE_SECTIONS[page] || []
          const allKeys = Object.keys(SECTION_REGISTRY)
          // Show page-specific sections first, then any remaining
          const orderedKeys = [
            ...pageSectionKeys,
            ...allKeys.filter(k => !pageSectionKeys.includes(k)),
          ]
          return (
            <div
              ref={addModalRef}
              role="dialog"
              aria-modal="true"
              aria-label="Add Section"
              tabIndex={-1}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowAddModal(false) }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)',
                zIndex: 2000,
                outline: 'none',
              }}
              onClick={() => setShowAddModal(false)}
            >
              <div
                style={{
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  padding: '20px',
                  width: '300px',
                  maxHeight: '500px',
                  overflow: 'auto',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                  Add Section
                </div>
                
                {/* Built-in Sections */}
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '8px' }}>
                  Teakle Sections
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {orderedKeys.map((key) => {
                    const cfg = SECTION_REGISTRY[key]
                    if (!cfg) return null
                    const isPageSpecific = pageSectionKeys.includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          handleAddSection(key)
                          setShowAddModal(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#ccc',
                          fontSize: '13px',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span>{cfg.label}</span>
                        {isPageSpecific && (
                          <span style={{ fontSize: '10px', color: '#666' }}>page</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                
                {/* Saved Templates */}
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                  Saved Templates
                </div>
                {sectionTemplates.length === 0 ? (
                  <div style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    color: '#555',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}>
                    No templates saved yet. Use the context menu on any section to save it as a template.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {sectionTemplates.map((template) => (
                      <div
                        key={template.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: 'transparent',
                          border: '1px solid transparent',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                      >
                        <button
                          type="button"
                          onClick={() => handleInstantiateTemplate(template.id)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '3px',
                            border: 'none',
                            background: 'transparent',
                            color: '#ccc',
                            fontSize: '13px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            padding: 0,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#ccc' }}
                        >
                          <span style={{ fontWeight: 500 }}>{template.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '10px',
                              color: '#A78659',
                              background: 'rgba(167, 134, 89, 0.12)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontWeight: 500,
                            }}>
                              {SECTION_REGISTRY[template.sectionType]?.label || template.sectionType}
                            </span>
                            {template.variant && (
                              <span style={{ fontSize: '10px', color: '#666' }}>
                                {template.variant}
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <span style={{ fontSize: '10px', color: '#555', lineHeight: 1.4 }}>
                              {template.description}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Delete template "${template.name}"?`)) {
                              handleDeleteTemplate(template.id)
                            }
                          }}
                          style={{
                            padding: '4px 6px',
                            border: 'none',
                            borderRadius: '4px',
                            background: 'transparent',
                            color: '#555',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#dc3545'; e.currentTarget.style.background = 'rgba(220,53,69,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent' }}
                          title="Delete template"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      background: 'transparent',
                      color: '#999',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Save Template Modal ──────────────────────────────────────── */}
        {showSaveTemplateModal && (
          <div
            ref={saveTemplateModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Save Section as Template"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowSaveTemplateModal(false) }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              zIndex: 2000,
              outline: 'none',
            }}
            onClick={() => setShowSaveTemplateModal(false)}
          >
            <div
              style={{
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '12px',
                padding: '20px',
                width: '320px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                Save Section as Template
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#666' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#444' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#666' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#444' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#999',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSaveTemplate}
                  disabled={!templateName.trim()}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: templateName.trim() ? '#007bff' : '#333',
                    color: templateName.trim() ? '#fff' : '#666',
                    fontSize: '12px',
                    cursor: templateName.trim() ? 'pointer' : 'default',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Save Page Template Modal ──────────────────────────────────────── */}
        {showSavePageTemplateModal && (
          <div
            ref={savePageTemplateModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Save Page as Template"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowSavePageTemplateModal(false) }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              zIndex: 2000,
              outline: 'none',
            }}
            onClick={() => setShowSavePageTemplateModal(false)}
          >
            <div
              style={{
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '12px',
                padding: '20px',
                width: '320px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                Save Page as Template
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={pageTemplateName}
                  onChange={(e) => setPageTemplateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#666' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#444' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={pageTemplateDescription}
                  onChange={(e) => setPageTemplateDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#666' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#444' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                This will save {sections.length} section{sections.length !== 1 ? 's' : ''} as a reusable template.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSavePageTemplateModal(false)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#999',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSavePageTemplate}
                  disabled={!pageTemplateName.trim()}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: pageTemplateName.trim() ? '#007bff' : '#333',
                    color: pageTemplateName.trim() ? '#fff' : '#666',
                    fontSize: '12px',
                    cursor: pageTemplateName.trim() ? 'pointer' : 'default',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="editor-canvas-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }} ref={canvasContainerRef}>
          <Canvas
            sections={sections}
            selectedSection={selectedSection}
            onSelectSection={(instanceId) => { setSelectedSection(instanceId); setSelectedElement(null) }}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onUpdateField={updateSectionData}
            viewMode={viewMode}
            loading={loading}
            page={page}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
          />
          
          <FloatingToolbar
            selectedElement={selectedElement}
            styleOverrides={selectedData ? (() => {
              try { return JSON.parse(selectedData.draftStyleOverrides || selectedData.styleOverrides || '{}') || {} }
              catch { return {} }
            })() : {}}
            onStyleChange={handleStyleChange}
            instanceId={selectedSection}
            containerRef={canvasContainerRef}
          />
        </div>
        
        <div className="editor-inspector">
          <Inspector
            instanceId={selectedSection}
            sectionKey={selectedData?.sectionKey || null}
            sectionData={selectedData}
            sectionConfig={selectedConfig}
            page={page}
            selectedElement={selectedElement}
            elements={selectedConfig ? getElementsForSection(selectedData?.sectionKey, page) : []}
            styleOverrides={selectedData ? (() => {
              try { return JSON.parse(selectedData.draftStyleOverrides || selectedData.styleOverrides || '{}') || {} }
              catch { return {} }
            })() : {}}
            sectionStyleOverrides={selectedData ? (() => {
              try { return JSON.parse(selectedData.draftSectionStyleOverrides || selectedData.sectionStyleOverrides || '{}') || {} }
              catch { return {} }
            })() : {}}
            onFieldChange={handleFieldChange}
            onStyleChange={handleStyleChange}
            onSectionStyleChange={handleSectionStyleChange}
            onVariantChange={handleVariantChange}
            onSave={() => selectedSection && saveDraft(selectedSection)}
            onPublish={() => selectedSection && publishSection(selectedSection)}
            onDiscard={() => selectedSection && discardDraft(selectedSection)}
            onOpenMedia={(fieldKey) => {
              if (selectedElement) {
                setMediaTarget({ instanceId: selectedSection, fieldKey: selectedElement.elementKey + ':' + fieldKey })
              } else {
                setMediaTarget({ instanceId: selectedSection, fieldKey })
              }
              setShowMedia(true)
            }}
            saving={saving}
            pageDesign={pageDesign}
            showPageDesign={showPageDesign}
            onPageDesignChange={handlePageDesignChange}
          />
        </div>
      </div>
    </div>
  )
}
