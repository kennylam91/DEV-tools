# Copilot Instructions for DEV-tools

## Project Overview

**DEV-tools** is a Vue 3 + Vite + TypeScript utility dashboard that provides a collection of developer tools including work logging, Base64 encoding/decoding, SBOM analysis, MongoDB query tools, and AI-powered lunch suggestions.

**Tech Stack**: Vue 3 (composition API), TypeScript, Vite, PrimeVue, Vue Router (file-based via unplugin-vue-router)

---

## Architecture & Key Patterns

### File-Based Routing

- Routes are automatically generated from the `src/views/` folder structure via `unplugin-vue-router`
- New pages are created as `.vue` files in `src/views/` (no manual route registration needed)
- Example: `src/views/base64/encode.vue` → `/base64/encode` route
- Router config: `vite.config.ts` has `VueRouter` plugin configured with async import mode

### Service Layer Pattern

- Services are abstraction interfaces with concrete implementations (e.g., `WorkLogServiceByLocalStorage`)
- All services use `localStorage` for persistence (no backend API currently)
- Example: `src/services/work-log-service.ts` implements CRUD via localStorage with username-based keys
- Access via factory function: `getWorkLogService()` returns singleton instance

### Auto-Import System

- Vue macros (ref, computed, watch, etc.) are auto-imported via `unplugin-auto-import`
- PrimeVue components auto-imported via `@primevue/auto-import-resolver`
- No manual `import` statements needed for these common utilities
- ESLint config auto-generated: `.eslintrc-auto-import.json`

### State Management

- Uses Vue `ref()` for reactive state (no Pinia/Vuex currently)
- Component-local state in `<script setup>`
- Services handle cross-component data (via localStorage)
- Example pattern in `work-logs.vue`: ref state + service interaction + watcher

### UI Component Library

- **PrimeVue 3.52.0** provides UI components (DataTable, Calendar, Button, Menu, etc.)
- Uses **PrimeFlex** for grid/spacing utility classes
- Custom theme: Aura Light Indigo with custom CSS in `src/assets/primevue-custom.css`
- Components auto-resolved in templates (no explicit imports)

---

## Developer Workflows

### Setup & Development

```sh
pnpm install --frozen-lockfile    # Install dependencies
pnpm dev                          # Start hot-reload dev server (default: localhost:5173)
```

### Quality Checks & Builds

```sh
pnpm type-check             # Type validation (via vue-tsc)
pnpm lint                   # ESLint + fix violations
pnpm format                 # Prettier formatting
pnpm build                  # Type-check + minified production build
pnpm build-only             # Minified build only (skips type-check)
pnpm preview                # Preview production build locally
```

### Key Commands

- **Type checking is separate**: `pnpm type-check` must run independently; `pnpm build` runs both type-check and build
- **Parallel build**: `run-p` from npm-run-all2 runs type-check and build-only concurrently
- **Hot reload**: Dev server watches `src/` and recompiles instantly

---

## Project-Specific Conventions

### Component Structure

- **Single-file components** with `<script setup lang="ts">` (Composition API)
- Prefer `ref()` + `watch()` for reactive logic over lifecycle hooks
- Template uses PrimeVue components; import-free via auto-resolve
- Example: `LogWorkForm.vue`, `work-logs.vue` use DataTable + Calendar + Buttons

### Data Models

- Located in `src/models/` as TypeScript interfaces/types
- Models describe JSON structures (e.g., `SpdxJson`, `WorkLog`, `RelationshipGraph`)
- Keep models focused on data shape; logic belongs in services

### Service Patterns

- Create interface first (`export interface XxxService`), then implementation class
- Export factory function: `export const getXxxService()` for singleton access
- Use `Promise` for all async operations (even localStorage for consistency)
- Store data: username-based keys in localStorage (e.g., `localStorage.getItem(this.username)`)

### View Organization

- Views in `src/views/` with subdirectories for feature grouping
- Group related tools: `/base64/{encode,decode}.vue`, `/sbom/{compare,relationship}.vue`
- Components in `src/components/` (reusable) vs views (page-level only)

### Styling Approach

- **Utility-first**: Use PrimeFlex classes (`gap-2`, `px-5`, `bg-gray-100`, etc.)
- **Custom overrides**: `primevue-custom.css` for theme customization
- **Scoped styles**: Add `<style scoped>` to components only when utilities insufficient

---

## Integration Points & Dependencies

### Third-Party Libraries

- **vue3-json-viewer**: JSON visualization (imported in `main.ts`, used in views)
- **vue-diff**: Side-by-side diff viewer (used in SBOM compare tool)
- **vue3-markdown-it**: Markdown rendering
- **packageurl-js**: Package URL parsing (likely for SBOM analysis)
- **json-2-csv**: CSV conversion utilities
- **date-fns**: Date manipulation (calendar/month filtering)

### Data Format Handling

- **JSON**: Core format; JSON Viewer component handles visualization
- **CSV**: json-2-csv for import/export (not yet visible in views)
- **SPDX**: Work with SBOM JSON format (see `spdx-json.ts` model)
- **Package URLs**: Parse/handle purl format (packageurl-js)

---

## Before Implementing New Features

1. **Add route**: Create `.vue` file in `src/views/` with appropriate structure
2. **Add data model**: Define interface in `src/models/` if needed
3. **Add service**: If cross-component data required, create service in `src/services/`
4. **Use existing patterns**: Follow component/service examples above
5. **Type everything**: Leverage TypeScript; run `pnpm type-check` before commit
6. **Check imports**: Verify auto-imports work (no manual imports needed for Vue/PrimeVue)
7. **Environment variables**: Add to `.env.local` if required; access via `import.meta.env.VITE_*`
