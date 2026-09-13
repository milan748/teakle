# Sprint 4 Implementation Plan — TEAKLE Page Builder Core

## Architecture Audit Summary

### Current State
- Sections identified by `sectionKey` (e.g., 'hero') — this is a TYPE, not unique ID
- Section order hardcoded in `PAGE_SECTIONS` constant — not mutable
- No stable IDs for instances
- Draft fields use `draft*` prefix
- Media table exists but no upload endpoint
- API: GET/PUT/POST per section, no bulk operations

### Critical Issues
1. **No Unique IDs**: Can't have two sections of same type
2. **Hardcoded Order**: Can't reorder sections
3. **No Add/Delete**: Sections fixed per page type

### Solution: Introduce `instanceId`
- Each section gets a unique `instanceId` (8-char UUID)
- Client generates IDs, server stores them
- Enables: add, delete, duplicate, reorder, undo/redo

---

## Implementation Order

### Phase 1: Schema Migration
- Add `instanceId` column to content_sections
- Add `sortOrder` column (already exists, ensure it's used)
- Backfill existing sections with generated IDs
- Update UNIQUE constraint: `(page, instanceId)` instead of `(page, sectionKey)`

### Phase 2: API Updates
- Add bulk operations endpoint: `/api/admin/content/[page]/sections`
  - POST: add section
  - PUT: reorder sections
  - DELETE: remove section
- Update existing endpoints to use instanceId
- Validate section types against registry

### Phase 3: CMS Layer
- Add `addSection(page, sectionKey, instanceId, sortOrder)`
- Add `deleteSection(page, instanceId)`
- Add `duplicateSection(page, instanceId, newInstanceId)`
- Add `reorderSections(page, orderedIds)`
- Update `saveDraftSection` to use instanceId

### Phase 4: EditorClient State Management
- Replace `sectionKeys` constant with dynamic sections array
- Each section has: `{ instanceId, sectionKey, ...data }`
- Add undo/redo history stack
- Add structural change handlers

### Phase 5: Section Management UI
- Left panel: section rows with instanceId
- Add Section button
- Duplicate action
- Delete action with confirmation
- Drag-and-drop reordering

### Phase 6: Undo/Redo
- History stack: `{ past, present, future }`
- Coalesce rapid text edits
- Structural operations: add, delete, duplicate, reorder
- Toolbar buttons: Undo, Redo

### Phase 7: Media Library
- Upload endpoint: POST `/api/admin/media/upload`
- File validation: type, size
- Safe filename generation
- Store metadata in media table
- Update MediaLibrary component

### Phase 8: Page Management
- Admin page list with status indicators
- Create new page
- Edit page
- Preview page

### Phase 9: Polish
- Empty states
- Error states
- Accessibility
- Performance

---

## Files to Modify

### Database
- `lib/db.js` — schema migration

### API
- `app/api/admin/content/[page]/route.js` — bulk operations
- `app/api/admin/content/[page]/[sectionKey]/route.js` — instanceId support
- `app/api/admin/media/upload/route.js` — new upload endpoint

### CMS Layer
- `lib/cms.js` — add/duplicate/delete/reorder functions

### Editor
- `app/admin/editor/EditorClient.js` — state management, undo/redo
- `app/admin/editor/Canvas.js` — instanceId-based rendering
- `app/admin/editor/Inspector.js` — save/publish with instanceId
- `app/admin/editor/EditorToolbar.js` — undo/redo buttons
- `app/admin/editor/sections/registry.js` — section type definitions

### Media
- `app/admin/MediaLibrary.js` — upload, grid, selection

### Admin
- `app/admin/page.js` — page list
- `app/admin/editor/[page]/page.js` — editor entry

---

## Test Strategy
- Add/duplicate/delete sections: verify persistence
- Reorder: verify order persists
- Undo/redo: verify state restoration
- Media: verify upload, selection, persistence
- Draft: verify structural changes draft correctly
- Publish: verify structural changes publish correctly
- Regression: 51/51 existing tests pass
