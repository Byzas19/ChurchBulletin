# St. Michael's Church Bulletin Generator

A simple, single-file web application for creating weekly church bulletins at St. Michael Ukrainian Catholic Church in Terryville, CT.

## Getting Started

1. Download `StMike_Bulletin_Generator.html`
2. Open it in a web browser (Chrome recommended)
3. That's it — no installation, no server, no dependencies

## What It Does

- Enter the weekly liturgy schedule (dates, times, intentions, donors)
- Add announcements with titles and text
- Upload and position images on the bulletin
- Preview the bulletin exactly as it will print
- Export to PDF (legal size, landscape, two-sided)
- Save and load bulletin data as `.bulletin` files

## How the Bulletin Works

The bulletin is printed on legal-size paper (14" × 8.5") in landscape, then folded in half:

- **Inside left** — Divine Liturgy Schedule
- **Inside right** — Announcements
- **Back cover** — Church contact information

## Quick Reference

| Formatting | Result | Use In |
|-----------|--------|--------|
| `+Name` | † Name | Intentions (deceased) |
| `@Text` | ***Bold Italic*** | Day notes (liturgical days) |
| `#` | • | Announcements (bullets) |
| `\n` | Line break | Day notes (multi-line) |

## Background

This application replaces an Excel/VBA-based system that had been in use since 2005. The original spreadsheet required ActiveX controls, a manual "Paste" button workflow, and specific computer configurations to function. This replacement runs in any modern web browser with no special setup.

See `CLAUDE.md` for detailed development context and technical documentation.

## License

This project was created for St. Michael Ukrainian Catholic Church. Feel free to adapt it for your own parish.
