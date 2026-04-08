# Productionalization Plan

This document tracks the work to productionalize the St. Michael's Church Bulletin Generator — originally a single-file HTML app prototyped on Claude.ai — into a project with proper module structure, unit tests, linting, and CI.

## Goals

1. Extract the monolithic JS into testable ES modules
2. Set up a bundler that compiles everything back into a single HTML file
3. Add linting (ESLint + Prettier)
4. Add unit tests (Vitest)
5. Make it CI-friendly (GitHub Actions)

## Hard Constraints (from CLAUDE.md)

- The final deliverable must still be a **single self-contained HTML file** (CSS + JS inlined, base64 images embedded). The priest opens one file in Chrome.
- No external CDN dependencies at runtime. `html2canvas` and `jsPDF` must be bundled.
- Backward compatibility with existing `.bulletin` save files.
- The fold line stays fixed at 50/50. Image aspect ratios stay locked.

## Toolchain

| Tool | Choice | Rationale |
|------|--------|-----------|
| Bundler | **Vite** + `vite-plugin-singlefile` | Native vanilla JS/HTML support; plugin inlines JS, CSS, and assets into one HTML file |
| Test Framework | **Vitest** | Vite-native (shared config), Jest-compatible API, built-in `happy-dom` environment, fast |
| DOM Environment | **happy-dom** | Lighter than jsdom, sufficient for this app's DOM manipulation |
| Linter | **ESLint v9** (flat config) | Current standard, catches logic bugs |
| Formatter | **Prettier** | Consistent formatting, integrates with ESLint via `eslint-config-prettier` |

## Phased Migration

### ✅ Phase 0 — Scaffold

Set up the toolchain without touching the original HTML file. The original `StMike_Bulletin_Generator.html` stays as-is throughout Phases 0 and 1 so the app keeps working.

**Files created:**

- `package.json` with `dev`, `build`, `test`, `lint`, `format` scripts
- `vite.config.js` (Vite + `viteSingleFile` plugin, inlines all assets)
- `vitest.config.js` (happy-dom environment, glob `src/__tests__/**/*.test.js`)
- `eslint.config.js` (flat config, ESLint v9, Prettier compat)
- `.prettierrc` (single quotes, trailing commas, 100-char lines, semis)
- `.gitignore` (ignores `node_modules/`, `dist/`)

**Dependencies installed:**

- Runtime: `html2canvas`, `jspdf`
- Dev: `vite`, `vite-plugin-singlefile`, `vitest`, `happy-dom`, `eslint`, `prettier`, `eslint-config-prettier`, `@eslint/js`, `shx`

**Verification:** `npm run dev`, `npm run build`, `npm test`, `npm run lint` all work on a placeholder `src/` directory.

### ✅ Phase 1 — Extract HTML/CSS/JS Shell

Moved the entire application into `src/` as three files, with all JS copied verbatim from the original. This is the "does the bundler pipeline still produce a working equivalent?" checkpoint.

**Files created:**

- `src/index.html` — HTML shell. Removed inline `<style>` and `<script>` blocks. Removed inline `onclick=""`/`oninput=""` attributes (replaced with IDs). CDN `<script>` tags for html2canvas/jsPDF removed.
- `src/styles.css` — CSS extracted verbatim from the `<style>` block.
- `src/main.js` — All JS extracted verbatim, plus:
  - `import html2canvas from 'html2canvas'` and `import { jsPDF } from 'jspdf'`
  - `import './styles.css'`
  - New event-wiring block at the bottom using `addEventListener` and `data-*` attribute event delegation for dynamic lists (schedule, announcements, pictures)
  - Removed the CDN-availability checks in `exportPDF` (no longer needed)
  - Fixed one pre-existing bug: `data.backCover.hasOwnProperty(k)` → `Object.prototype.hasOwnProperty.call(data.backCover, k)`

**Event delegation pattern:**

The original used `onclick="schedule[0].date=this.value"` inline handlers. These are replaced with `data-sched-idx`/`data-sched-field` attributes and a single delegated listener on the list container:

```js
document.getElementById('scheduleList').addEventListener('input', function (e) {
  const idx = e.target.dataset.schedIdx;
  const field = e.target.dataset.schedField;
  if (idx !== undefined && field) {
    state.schedule[parseInt(idx)][field] = e.target.value;
  }
});
```

**Verification:** `npm run build` produces `dist/StMike_Bulletin_Generator.html` — a ~830 KB single file with all JS, CSS, and both libraries inlined. No external `<script>` or `<link>` tags in the output. `npm test` (1 smoke test) and `npm run lint` (0 errors) both pass. The original `StMike_Bulletin_Generator.html` at the project root is still untouched.

### ✅ Phase 2 — Module Decomposition

Split the monolithic `src/main.js` into focused ES modules. Converted all `var` to `const`/`let` during extraction.

**Final structure:**

```
src/
  data/
    defaults.js           # DEFAULT_COL_WIDTHS, DEFAULT_SECTION_MARGINS,
                          # DEFAULT_BACK_COVER, SAMPLE_SCHEDULE,
                          # SAMPLE_ANNOUNCEMENTS, MEASURE_CSS/FONT, COL_WIDTH
  state/
    store.js              # Single mutable state object (default export)
  utils/
    formatting.js         # fmtDateShort, fmtTime, fmtBulletinDate,
                          # processText, escHtml, renderIntention
    html-builders.js      # buildScheduleHtml, buildAnnHtml
    measure.js            # measureHtml (DOM-dependent)
  ui/
    tabs.js               # switchTab, switchPreviewPage, setPreviewCallbacks
    schedule-tab.js       # renderSchedule, addScheduleRow, wireScheduleEvents
    announcements-tab.js  # renderAnnouncements, addAnnouncement, wireAnnouncementEvents
    pictures-tab.js       # handleImageUpload, renderPicGallery, removePicture, wirePictureEvents
    backcover-tab.js      # renderBackCover, wireBackCoverEvents
    font-sizes.js         # getSchedFontSize, getAnnFontSize, getSchedFontSizeValue
    move-item.js          # moveItem (shared array swap utility)
  preview/
    generate.js           # generatePreview, generateBackCoverPreview
    resize-handles.js     # setupColumnResizers, setupMarginHandles, positionMarginHandle
    draggable-images.js   # addDraggableImage
  export/
    pdf.js                # exportPDF
    save-load.js          # exportData, importData, clearAll
  main.js                 # Thin entry point — imports modules, wires toolbar/tab events, calls init renders
  index.html              # HTML shell
  styles.css              # All CSS
```

**Key architectural decisions:**

1. **Single state store.** `src/state/store.js` exports one mutable object holding `schedule`, `announcements`, `pictures`, `picIdCounter`, `colWidths`, `sectionMargins`, `backCover`, `previewPage`. All modules import this and mutate it. No state management library — the app is small enough that a plain object with live references is simpler.

2. **Circular dependency resolution.** `tabs.js` needs to call `generatePreview`/`generateBackCoverPreview`, but `generate.js` already imports UI helpers. Solved via a `setPreviewCallbacks(front, back)` function exported from `tabs.js` that `main.js` calls at startup to inject the callbacks.

3. **DOM-reading functions refactored.** `buildScheduleHtml` originally read `document.getElementById('schedFontSize').value` directly. Now takes `schedFontSizeValue` as a parameter, keeping the builder testable without DOM setup.

4. **Event wiring co-located with render functions.** Each UI module exports both a `renderX()` function and a `wireXEvents()` function. `main.js` calls `wireXEvents()` once at startup to attach delegated listeners — these persist across re-renders.

5. **`var` → `const`/`let`.** All occurrences converted during extraction. The `no-var` rule was temporarily downgraded to `warn` after Phase 1 (181 warnings) and is now back to clean (0 `no-var` warnings after Phase 2).

**Verification:** `npm run build` succeeds (832 KB single file). `npm run lint` shows 0 errors (down from 182 in Phase 1). Tests still pass.

### ✅ Phase 3 — Unit Tests

Added 52 unit tests across 5 test files covering the most valuable logic. Tests run against the extracted modules using Vitest + happy-dom.

**Test files:**

| File | Tests | Coverage |
|------|-------|----------|
| `src/__tests__/utils/formatting.test.js` | 22 | Date formatting, time conversion (12/24h, noon/midnight), bulletin date, `+Name` → †Name, `#` → bullet, `@Text` → bold italic, HTML escaping, `renderIntention` XSS safety |
| `src/__tests__/utils/html-builders.test.js` | 10 | Schedule HTML header, colgroup widths, prefix line splitting on `\\n`, `@`-prefixed liturgical day notes, multi-row rendering, announcement HTML structure, HTML escaping in title/text |
| `src/__tests__/ui/move-item.test.js` | 6 | Adjacent swap up/down, boundary conditions (first/last), single-element, object entries |
| `src/__tests__/export/save-load.test.js` | 3 | `exportData` JSON shape and all expected keys, `clearAll` state reset, `clearAll` cancel on user decline |
| `src/__tests__/preview/generate.test.js` | 3 | Overflow balancing — all announcements fit right, overflow to left column when right is too tall, image count in layout info |

**Key testing patterns:**

- **Pure logic first.** `formatting.js`, `move-item.js`, and most of `html-builders.js` are tested with plain assertions — no DOM setup required (beyond happy-dom's default `document` for `escHtml`).
- **DOM fixtures via `document.body.innerHTML`.** For tests that touch the DOM (`exportData`, `clearAll`, `generatePreview`), a minimal DOM is set up in `beforeEach` with just the elements the function reads.
- **Mocked measurements for overflow algorithm.** The overflow balancing test mocks `measureHtml` via `vi.spyOn` to return deterministic heights. This lets us verify the split algorithm without relying on actual layout, which happy-dom doesn't compute reliably.
- **Dynamic imports.** Tests use `await import('../../export/save-load.js')` instead of top-level imports so that any module-level DOM reads happen *after* the fixture is set up.
- **Direct assignment for missing happy-dom APIs.** `window.confirm` isn't defined by default in happy-dom. Tests assign `window.confirm = vi.fn(() => true)` directly instead of `vi.spyOn`.

**Not tested (deferred):**

- `exportPDF` — Would require a real browser to verify html2canvas output. Stays a manual test.
- Drag/drop and resize handles — Mouse event simulation is fragile and low-value compared to manual testing.
- Tab switching and full event wiring — Exercised indirectly through the other tests and manual verification.

**Verification:** `npm test` — 52/52 tests pass across 5 files. `npm run lint` — 0 errors.

### ✅ Phase 4 — Linting Cleanup

Ran ESLint `--fix` and Prettier `--write` across `src/`. Upgraded `no-var` and `prefer-const` from `warn` to `error`. Tightened `no-unused-vars` to `error` with `caughtErrorsIgnorePattern: '^_'` so intentionally-ignored catch bindings (e.g. `_err` in `save-load.js`) don't trip the rule.

**Verification:** `npm run lint` — 0 errors, 0 warnings. `npm run format:check` — clean. `npm test` — 52/52 pass. `npm run build` — 830 KB single file.

### ✅ Phase 5 — CI (GitHub Actions)

Added [.github/workflows/ci.yml](.github/workflows/ci.yml). Runs on push/PR to `main`/`master`:

1. `npm ci`
2. `npm run lint`
3. `npm run format:check`
4. `npm test`
5. `npm run build`
6. Greps `dist/StMike_Bulletin_Generator.html` for external `<script src=>`/`<link href=>` and fails if any are present
7. Uploads `dist/StMike_Bulletin_Generator.html` as a workflow artifact

## Current Status

| Metric | Value |
|--------|-------|
| Source files | 20 ES modules + `index.html` + `styles.css` + `main.js` |
| Unit tests | 52 passing across 5 files |
| Lint errors | 0 |
| Build output | `dist/StMike_Bulletin_Generator.html` (~832 KB, single file, no external deps) |
| Original file | `StMike_Bulletin_Generator.html` at project root — untouched |

## Developer Workflow

```bash
npm run dev            # Vite dev server with HMR at http://localhost:5173
npm run build          # Produces dist/StMike_Bulletin_Generator.html
npm test               # Run all Vitest tests once
npm run test:watch     # Vitest in watch mode
npm run lint           # ESLint
npm run lint:fix       # ESLint with --fix
npm run format         # Prettier --write
npm run format:check   # Prettier --check (for CI)
```

## File Inventory

| Path | Purpose |
|------|---------|
| `StMike_Bulletin_Generator.html` | **Original** single-file app — reference/backup, still works standalone |
| `src/` | New modular source tree |
| `dist/StMike_Bulletin_Generator.html` | **Built** single-file output from `npm run build` |
| `package.json` | npm scripts and dependencies |
| `vite.config.js` | Vite build configuration (single-file output) |
| `vitest.config.js` | Test runner configuration |
| `eslint.config.js` | ESLint flat config |
| `.prettierrc` | Prettier config |
| `CLAUDE.md` | Project context for AI-assisted development |
| `PRODUCTIONALIZATION.md` | This file |
