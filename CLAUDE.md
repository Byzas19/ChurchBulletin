# St. Michael's Church Bulletin Generator — Project Context

## What This Is

A single-file HTML web application (`StMike_Bulletin_Generator.html`) that replaces an aging Excel/VBA-based system for generating weekly church bulletins at **St. Michael Ukrainian Catholic Church** in Terryville, CT. The bulletin is a two-sided document printed on legal-size paper (14" × 8.5") in landscape orientation, folded in half to create a four-page booklet.

## Who It's For

The primary end user is the parish priest — an older gentleman who wears progressive lenses and is not highly technical. **Accessibility is a core design requirement.** All UI decisions (font sizes, button sizes, control simplicity) must prioritize his ability to comfortably read and operate the tool. He previously used an Excel spreadsheet with VBA macros that had numerous usability problems (ActiveX controls that wouldn't work on some computers, a non-obvious "Paste" button workflow, no validation, fragile named ranges, etc.).

## How It Was Built

This application was developed iteratively across multiple sessions between a developer (Justin) and Claude (Anthropic's AI assistant) on claude.ai. Each session addressed specific features or bugs, building incrementally on the previous state. The conversation-driven development process means the codebase reflects practical, working solutions that were tested and refined through real user feedback — including screenshots and PDF comparisons.

## Architecture

### Single-File Design

The entire application is one self-contained HTML file with embedded CSS and JavaScript. No build step, no dependencies to install, no server required. The priest opens the file in a web browser and it works. This was a deliberate architectural choice to keep deployment as simple as possible for a non-technical environment.

### External Libraries (CDN)

- **html2canvas** (1.4.1) — captures the bulletin preview as an image for PDF export
- **jsPDF** (2.5.1) — generates the PDF file from the captured image

### Data Format

Bulletins are saved as `.bulletin` files (JSON with a custom extension to make them recognizable to the user). The format also accepts `.json` for backward compatibility. The file contains all bulletin data: schedule entries, announcements, pictures (as base64 data URIs), column widths, section margins, font sizes, and back cover information.

## Application Structure

### Tabs

1. **Liturgy Schedule** — Date, time, intention, donor, and optional liturgical day notes for each service
2. **Announcements** — Title and text for each announcement (title on its own line above text)
3. **Back Cover** — Church name, address, and contact information (labels are fixed; values are editable)
4. **Pictures** — Upload images that can be positioned and resized on the bulletin preview
5. **Preview** — Live preview with toggle between "Inside (Front)" and "Back Cover" pages

### Toolbar

- **Load** — Opens `.bulletin` or `.json` files; refreshes whichever tab is currently active
- **Save** — Downloads current bulletin as a `.bulletin` file
- **Clear** — Resets all data (with confirmation)
- **Export PDF** — Generates a legal-landscape PDF of whichever preview page is currently shown
- **Schedule/Announcements font size** dropdowns (7pt–12pt, default 9.5pt)

### Preview Features

- **Two-column layout** with a fixed center divider (represents the physical fold line — never user-adjustable)
- **Draggable margin handles** (gold highlights on hover) on the left/right edges of both columns
- **Draggable column width handles** on the schedule table columns (date, time, donor widths)
- **Image positioning** — drag to move, corner handle to resize (aspect ratio locked)
- **Announcements auto-balance** — overflow announcements from the right column wrap to the left column below the schedule
- **Front/Back toggle** — switches preview between the inside page and the back cover

### Back Cover

- Information box is fixed in the upper-left 25% of the page (50% width × 50% height)
- Content is centered within that box
- Not user-resizable (boundary is locked)

### PDF Export

- Captures the `previewBox` element directly using html2canvas
- Preview box padding is temporarily zeroed during capture
- Forced to exact 14:8.5 aspect ratio to prevent any stretching
- All UI handles (margin, column resize, image controls) are hidden during capture
- Uses PNG format for image fidelity
- Filename includes `_backcover` suffix when exporting the back cover page

## Key Design Decisions & Constraints

### The Fold Line Is Sacred

The center divider between the schedule (left) and announcements (right) columns is fixed at 50/50. It represents where the physical bulletin gets folded. It must never be user-adjustable.

### Image Aspect Ratio Locking

When resizing images on the preview, the aspect ratio is locked — width drives height based on the image's natural dimensions. This was added because html2canvas doesn't honor CSS `object-fit: contain`, which caused images to appear stretched in exported PDFs.

### Accessibility First

- Input fonts: 16px throughout
- Labels: 13px
- Buttons: enlarged (30px move/delete buttons)
- Toggle buttons: 14px with generous padding
- All choices prioritize readability for someone with vision challenges

### Special Formatting Characters (from legacy system)

- `+Name` → † Name (cross symbol for deceased)
- `@Text` → **_Bold Italic_** text (for liturgical days like "@Sunday of Meat Fare")
- `#` → • bullet point (in announcements)
- `\\n` in day notes → line break (for multi-line liturgical notes like "Presentation in the Temple\\nBlessing of Candles")

## Data Model

```javascript
// Schedule entry
{ date: "2026-02-02", time: "08:00", intention: "+Jaroslaw Czerwoniak", donor: "K Czerwoniak", prefix: "Presentation in the Temple\\nBlessing of Candles" }

// Announcement
{ title: "CCD CLASSES:", text: "Continue today (weather permitting) after the 9.00 am Divine Liturgy." }

// Picture
{ id: 1, name: "image.png", dataUrl: "data:image/png;base64,...", xPct: 5, yPct: 70, wPx: 120, hPx: 100 }

// Back Cover
{ churchName, address1, address2, priestLabel, priestName, phoneLabel, phone, faxLabel, fax, emailLabel, email, websiteLabel, website }

// Layout settings
colWidths: { date: 70, time: 55, donor: 85 }  // px, intention column is flexible
sectionMargins: { leftOuter: 20, leftInner: 14, rightInner: 14, rightOuter: 20 }  // px
```

## Known Quirks & Gotchas

1. **html2canvas limitations** — It doesn't perfectly render all CSS. The preview is designed to work within its constraints. Avoid CSS features that html2canvas doesn't support well (e.g., `object-fit` on images inside captured elements).

2. **Image positions stored as percentages** (xPct, yPct) relative to the bulletin content div, but sizes stored as pixels (wPx, hPx). This means image positions scale with the preview size but dimensions don't — a deliberate choice for consistent sizing across different screen widths.

3. **The bulletin element uses `height: 100%`** to fill the preview box (which has `aspect-ratio: 14/8.5`). This ensures the PDF capture includes the full page area. Don't change this to `flex: 1` or `min-height` — those approaches were tried and caused image positioning/clipping issues.

4. **PDF export temporarily zeroes preview box padding** — this is necessary so the captured area matches the full page. The padding is restored immediately after capture.

5. **The `.bulletin` file extension** was chosen specifically because the primary user wouldn't know to look for `.json` files. The internal format is still JSON.

6. **Church logo** is embedded as a base64 data URI in the header and as a favicon. The favicon only works when served from a web server, not when opening the file directly from disk.

## Legacy System Reference

The original system (`StMike_Bulletin.xls` / `.xlsm`) is an Excel workbook with VBA macros containing four sheets:

- **InformationEntry** — Data input (liturgy schedule in columns B-E, announcements in columns G-H)
- **InsideSheet** — Formatted output for printing
- **BackCover** — Back page with church contact information
- **SizeAndIncrement** — Font size and spacing configuration

The project context document (`StMike_Bulletin_Project_Context.md`) contains exhaustive documentation of the VBA code, named ranges, known issues, and the complete data model.

## Development Roadmap

### Completed Features

- [x] Liturgy schedule entry with date, time, intention, donor, day notes
- [x] Announcements entry with title/text on separate lines
- [x] Back cover tab with prefilled church contact information
- [x] Pictures upload, drag positioning, aspect-ratio-locked resizing
- [x] Live preview with front/back page toggle
- [x] PDF export (legal landscape, matching preview exactly)
- [x] Save/Load with `.bulletin` extension (`.json` backward compatible)
- [x] Adjustable schedule/announcement font sizes
- [x] Adjustable schedule table column widths (drag handles)
- [x] Adjustable section margins (drag handles on column edges)
- [x] Special character formatting (+, @, #, \\n)
- [x] Announcement overflow auto-balancing between columns
- [x] Church logo in header and favicon
- [x] Accessibility-driven UI (16px inputs, enlarged buttons)
- [x] Auto-refresh active tab on file load

### Potential Future Enhancements

- [ ] Back cover images/content beyond the info box (icon images, articles like in the physical bulletin photo)
- [ ] Template system for liturgical seasons (different headers/colors for Lent, Pascha, etc.)
- [ ] Auto-save / browser local storage to prevent data loss
- [ ] Print directly from browser (in addition to PDF export)
- [ ] Undo/redo functionality
- [ ] Common intention phrases auto-complete
- [ ] Donor name auto-complete from history
- [ ] Email distribution of PDF to parishioners
- [ ] Import from legacy `.bulletin` text archive files (the old VBA archive format)
- [ ] Multi-language support (Ukrainian text in bulletins)

## File Inventory

| File                                 | Purpose                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `StMike_Bulletin_Generator.html`     | The application (single self-contained file)            |
| `CLAUDE.md`                          | This file — project context for AI-assisted development |
| `StMike_Bulletin_Project_Context.md` | Detailed documentation of the legacy Excel/VBA system   |
| `StMike_Bulletin.xlsm`               | Legacy Excel workbook (macro-enabled, for reference)    |
| `StMike_Bulletin.xls`                | Original Excel 97-2003 format (for reference)           |

## Development Guidelines

When making changes to this application:

1. **Keep it single-file.** No build steps, no npm, no frameworks. The priest opens one HTML file in Chrome and it works.
2. **Test PDF export after any layout changes.** The html2canvas capture is sensitive to CSS changes. Always verify that the exported PDF matches the preview.
3. **Think about the user.** Every UI element should be large enough and clear enough for an older person with progressive lenses to use comfortably.
4. **The fold line is fixed.** Never make the center column divider adjustable.
5. **Preserve backward compatibility** with existing `.bulletin` save files when changing the data model.
6. **Embedded assets only.** Images (logo, favicon) must be base64 data URIs, not external file references.
7. **Test with images.** Image positioning in the PDF has been a recurring challenge. Any changes to the preview layout or capture logic should be verified with dragged/resized images.
