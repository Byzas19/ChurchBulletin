# St. Michael's Church Bulletin System - Project Context

## Overview
This document summarizes the existing Excel-based bulletin generation system used by St. Michael's Ukrainian Catholic Church. This serves as the foundation for developing a replacement application.

---

## Current System Architecture

### File Information
- **Original File**: StMike_Bulletin.xls (Excel 97-2003 format)
- **Converted File**: StMike_Bulletin.xlsm (Excel Macro-Enabled Workbook)
- **Creation Date**: October 2005
- **Last Major Update**: February 2026
- **Technology**: Excel VBA with ActiveX command buttons
- **Primary User**: Church administrator (typically priest or parish secretary)

### Workbook Structure

The spreadsheet contains **4 sheets**:

1. **InformationEntry** (Sheet1) - Data input interface
2. **InsideSheet** (Sheet2) - Formatted output for printing
3. **BackCover** (Sheet3) - Back page content
4. **SizeAndIncrement** (Sheet4) - Configuration settings

---

## Data Input Specifications

### InformationEntry Sheet Layout

#### Liturgy Schedule Section
- **Column B**: Date (e.g., 2/16/2026)
- **Column C**: Time (e.g., 9:00, 13:00, 16:00)
- **Column D**: Intention (mass intention text)
- **Column E**: Donor/Requestor name

**Data starts at Row 8** (`SRC_START_ROW = 8`)

#### Announcements Section
- **Column G**: Announcement Title (e.g., "CCD CLASSES:", "COFFEE AND CAKE:")
- **Column H**: Announcement Text (full description)

**Data starts at Row 8** (`SRC_START_ROW = 8`)

#### Configuration Cells
- **Cell B3**: Number of announcements to display on Page 1 (rest go to Page 2)
- **Cell B4**: Sunday Date (referenced by InsideSheet header via formula `=InformationEntry!$B$4`)

### Special Formatting Characters

The system uses special character codes that get converted during formatting:

| Input Character | Output | Purpose |
|----------------|--------|---------|
| `@` (at start) | Bold + Italic | Highlights special liturgical days (e.g., "@First Sunday of Lent") |
| `+` (before name) | † (cross symbol) | Indicates deceased person (e.g., "+Maria" → "† Maria") |
| `#` | • (bullet) | Creates bullet list items in announcements |

**Implementation Details:**
- `Chr(134)` = † (cross symbol, ASCII 134)
- `Chr(186)` = • (bullet symbol, ASCII 186)

---

## Output Specifications

### InsideSheet Layout

#### Page 1 (Left Side) - Columns A-D
- **Rows 1-2**: Header with date
- **Row 3+**: Divine Liturgy Schedule
  - Formatted as: "Mon 16 Feb" | "9:00AM" | "Intention" | "Donor"
  - Date format: `Format(date, "ddd dd mmm")`
  - Time format: `Format(time, "h:mmAMPM")`
- **After schedule**: Horizontal separator line (xlEdgeTop border)
- **Below separator**: First N announcements (N defined by cell B3)

#### Page 2 (Right Side) - Columns G-J
- **Continuation of announcements** (after Page 1 limit reached)

#### Font Specifications
- **Schedule Font**: Arial (size from SizeAndIncrement sheet)
- **Announcement Title Font**: Verdana, Bold (size from SizeAndIncrement sheet)
- **Announcement Text Font**: Arial (size from SizeAndIncrement sheet)

---

## Core Workflow

### Critical User Workflow
```
1. Enter data on InformationEntry sheet
   ↓
2. CLICK THE "PASTE" BUTTON ← CRITICAL STEP
   (This runs VBA code to format the bulletin)
   ↓
3. Click "Print Preview" to verify layout
   ↓
4. Click "Print" to print bulletin
```

### Why the Paste Button Is Critical

The Paste button (`cmdPaste_Click`) performs these operations:

1. **Clears the output area** (rows 2-200 on InsideSheet)
   - Preserves row 1 (header with date formula)
   - Clears columns A-L to remove old content
   
2. **Transfers liturgy schedule**
   - Reads from InformationEntry columns B-E, starting row 8
   - Formats dates and times
   - Converts `+` to † symbol
   - Converts `@` prefix to bold/italic formatting
   - Wraps long intention text across multiple rows using `.Justify` method
   
3. **Draws separator line**
   - Adds horizontal border after last schedule entry
   
4. **Transfers announcements**
   - Reads from InformationEntry columns G-H, starting row 8
   - First N announcements → Page 1 (columns A-D)
   - Remaining announcements → Page 2 (columns G-J)
   - Converts `#` to • bullets
   - Wraps long text using `.Justify` method
   - Chunks text into 255-character segments if needed

**Without clicking Paste, data remains unformatted and overlaps with previous content.**

---

## VBA Code Architecture

### Main Procedures

#### `cmdPaste_Click()` - Core Formatting Engine (Line 817)
- Entry point for bulletin formatting
- Orchestrates the entire data transfer and formatting process
- Calls `putOneSchedule()` and `putOneAnnouncement()` for each entry

#### `putOneSchedule(srcRange, trgRange)` - Schedule Formatter (Line 443)
- Formats individual liturgy schedule entries
- Handles date/time formatting
- Converts `+` to cross symbol (Chr(134))
- Converts `@` prefix to bold/italic
- Uses `.Justify` to wrap long intention text
- Returns next available row number

#### `putOneAnnouncement(srcRange, trgRange)` - Announcement Formatter (Line 284)
- Formats individual announcements
- Handles title (Verdana, bold) and text (Arial, normal)
- Converts `+` to cross symbol
- Converts `#` to bullet symbol (Chr(186))
- Chunks text into 255-character segments
- Uses `.Justify` for text wrapping
- Returns next available row number

#### `cmdPrint_Click()` - Print Handler (Line 933)
- Prompts user to verify printer is ready
- Prints InsideSheet (page 1)
- Prompts user to reorient paper
- Prints BackCover (reverse side)

#### `cmdPrintPreview_Click()` - Preview Handler (Line 969)
- Shows print preview of InsideSheet

### Helper Procedures

- `cmdClear_Click()` - Clears all data from InformationEntry sheet
- `cmdScheduleInsert_Click()` / `cmdScheduleDelete_Click()` - Add/remove liturgy rows
- `cmdAnnouncementInsert_Click()` / `cmdAnnouncementDelete_Click()` - Add/remove announcement rows
- `cmdArchive_Click()` / `cmdRestore_Click()` - Save/load bulletin data to text file
- `cmdInsertPicture_Click()` - Insert images into bulletin
- `convertTime()` - Normalizes time entry (e.g., "9" → "9:00")
- `removeQuotes()` - Strips quotation marks from strings

### Important Constants (Line 7-48)

```vba
Const SRC_START_ROW = 8              ' First data row on InformationEntry
Const TRG_START_ROW = 3              ' First output row on InsideSheet
Const SYMBOL_CROSS = 134             ' ASCII code for †
Const SYMBOL_BULLET = 186            ' ASCII code for •
Const ANNOUNCEMENT_MESSAGE_MAX_LENGTH = 255  ' Text chunk size
```

---

## Named Ranges

Critical named ranges used throughout the code:

### InformationEntry Sheet
- `IE_LiturgySchedule` - Range for liturgy schedule data (B8:E50)
- `IE_Announcements` - Range for announcement data (G8:H50)
- `IE_SundayDate` - Cell containing bulletin date (B4)
- `IE_NumAnnouncementsPage1` - Number of announcements on page 1 (B3)

### InsideSheet
- `IS_PageOne` - Output area for page 1 (A2:F200)
- `IS_PageTwo` - Output area for page 2 (G2:L200)

### SizeAndIncrement Sheet
- `SAZ_ScheduleFontSize` - Font size for liturgy schedule
- `SAZ_AnnouncementFontSize` - Font size for announcement text
- `SAZ_AnnouncementHeaderFontSize` - Font size for announcement titles
- `SAZ_ScheduleIncrement` - Row spacing after schedule
- `SAZ_AnnouncementIncrement` - Row spacing after announcements
- `SAZ_AnnouncementHeaderIncrement` - Row spacing after announcement title
- `SAZ_AnnouncementIndent` - Indent level for announcements

---

## Known Issues & Compatibility Problems

### Issue 1: ActiveX Controls Blocked on Some Computers
**Symptom**: Buttons appear but are not clickable; clicking selects the button instead of running the macro

**Root Cause**: 
- IT group policies on some computers block ActiveX controls
- Security settings prevent ActiveX controls from executing
- Controls may have lost their event handler connections during file conversion

**Workaround Implemented**:
Created public wrapper functions that can be run via Alt+F8 or Quick Access Toolbar:
```vba
Public Sub RunPaste()
    Call cmdPaste_Click
End Sub

Public Sub RunPrint()
    Call cmdPrint_Click
End Sub

Public Sub RunPrintPreview()
    Call cmdPrintPreview_Click
End Sub
```

### Issue 2: Clear Operation Fails Silently
**Symptom**: Content overlaps and repeats; announcements appear mangled with text from previous weeks

**Root Cause**: 
- Original named ranges `IS_PageOne` and `IS_PageTwo` only covered rows 2-48
- When bulletins exceed 48 rows, old content in rows 49+ remains
- New content gets added, overlapping with old content

**Solution Implemented**:
```vba
'Clear entire output area except header row
Worksheets("InsideSheet").Range("A2:L200").Clear
```

### Issue 3: Range.Justify Method Compatibility
**Symptom**: Text wrapping may fail or behave inconsistently in modern Excel versions

**Root Cause**: 
- The `.Justify` method was deprecated and behaves differently in Excel 2016+
- Some versions of Excel changed how this method handles text overflow

**Mitigation**: 
Added error handling around `.Justify` calls:
```vba
On Error Resume Next
.Justify
On Error GoTo PUTONEANNOUNCEMENT_ERROR
```

### Issue 4: Design Mode Confusion
**Symptom**: Buttons become selectable/editable instead of clickable

**Root Cause**: 
- Excel sometimes stays in Design Mode after editing VBA or button properties
- Design Mode allows editing controls instead of using them

**Solution**: 
Ensure Design Mode is OFF (Developer tab → Design Mode button should not be highlighted)

---

## Archive/Restore Feature

### Archive File Format (.bulletin)

The system can save bulletin data to a custom text file format:

```
BULLETIN DATA
SUNDAY DATE:[date]
NUMBER OF ANNOUNCMENTS:[count]
LITURGY SCHEDULE:
[date],[time],[intention],[donor]
[date],[time],[intention],[donor]
...
ANNOUNCEMENTS:
[title],[text]
[title],[text]
...
PICTURES:
[filename1]
[filename2]
...
```

**Archive Location**: Configurable via `ARCHIVE_FOLDER` constant (default: C:\)

**FTP Upload**: System includes batch file integration (`FTPbulletin.bat`) to upload bulletin to website

---

## Print Specifications

### Page Setup
- **Printer**: Brother FC-L3770CDW series (as configured in original system)
- **Paper**: Custom bulletin paper stock (two-sided)
- **Print Sequence**:
  1. InsideSheet (page 1)
  2. User reorients paper
  3. BackCover (reverse side)

### Print Area
- Dynamically calculated based on last row used
- Set via `Worksheets("InsideSheet").PageSetup.PrintArea` (currently commented out in code)

---

## Modernization Changes Made

### 1. File Format Conversion
- Converted from .xls (Excel 97-2003) to .xlsm (Excel 2007+ Macro-Enabled)
- Benefits: Better compatibility, smaller file size, no more compatibility warnings

### 2. Clear Operation Fix
Changed from:
```vba
Worksheets("InsideSheet").Range("IS_PageOne").Clear
Worksheets("InsideSheet").Range("IS_PageTwo").Clear
```

To:
```vba
Worksheets("InsideSheet").Range("A2:L200").Clear
```

This ensures:
- Clears sufficient rows (200 instead of 48)
- Preserves header row (row 1)
- Uses explicit range instead of potentially broken named ranges

### 3. Public Wrapper Functions
Added accessible macro wrappers for ActiveX-blocked environments:
```vba
Public Sub RunPaste()
Public Sub RunPrint()
Public Sub RunPrintPreview()
```

### 4. Error Handling Improvements
Added screen update and calculation management:
```vba
Application.ScreenUpdating = False
Application.Calculation = xlCalculationManual
' ... formatting code ...
Application.ScreenUpdating = True
Application.Calculation = xlCalculationAutomatic
```

---

## User Experience Pain Points

### Current System Issues

1. **Non-Obvious Critical Step**: Users must remember to click Paste button after data entry
   - No visual reminder
   - Easy to skip and go straight to Print
   - Results in corrupted output if forgotten

2. **No Auto-Save**: Changes lost if Excel crashes during formatting

3. **Manual Text Formatting**: Special characters (@, +, #) are not intuitive
   - Requires memorization or reference card
   - Easy to forget or misuse

4. **No Validation**: System accepts any input
   - No date validation
   - No time format checking
   - Can enter invalid data that breaks formatting

5. **Computer-Specific Failures**: 
   - ActiveX controls blocked on some computers
   - Different computers may have different security settings
   - No graceful degradation

6. **Single User**: No collaboration or remote access
   - Must use specific computer with Excel installed
   - Cannot work from home or multiple locations

7. **No Preview Before Format**: Must click Paste, then check if it looks right
   - Trial and error process
   - Must manually clear and redo if mistakes found

8. **Fragile Named Ranges**: 
   - Named ranges can break if rows/columns inserted
   - No protection against accidental editing of output sheet
   - No warning if ranges are corrupted

---

## Required Features for Replacement Application

### Must-Have Features

1. **Data Entry**
   - Liturgy schedule: Date, Time, Intention, Donor
   - Announcements: Title, Text
   - Sunday date for bulletin header
   - Number of page 1 announcements

2. **Automatic Formatting**
   - No manual "Paste" button - format on save or automatically
   - Special character handling (†, •, bold/italic)
   - Text wrapping and layout
   - Two-column layout (page 1 / page 2)

3. **Print/Export**
   - Print preview
   - PDF export
   - Two-sided printing support

4. **Archive/History**
   - Save past bulletins
   - Load previous bulletin as template
   - Browse bulletin history

5. **Validation**
   - Date validation
   - Time format checking
   - Required field enforcement

### Nice-to-Have Features

1. **Visual Editor**: WYSIWYG interface instead of spreadsheet grid

2. **Templates**: Pre-defined templates for special liturgical seasons

3. **Cloud Storage**: Save bulletins to cloud for multi-computer access

4. **Collaboration**: Multiple users can prepare bulletin

5. **Mobile Access**: Enter data from phone/tablet

6. **Auto-Completion**: Common intention phrases, donor names

7. **Special Character Buttons**: Click to insert †, • instead of typing codes

8. **Undo/Redo**: Full edit history

9. **Version Control**: Track changes, revert to previous versions

10. **Email Distribution**: Send PDF directly to parishioners

---

## Technical Specifications for Replacement

### Data Model

```
Bulletin {
  id: string
  sundayDate: Date
  createdDate: Date
  modifiedDate: Date
  liturgySchedule: LiturgyEntry[]
  announcements: Announcement[]
  numPage1Announcements: number
}

LiturgyEntry {
  id: string
  date: Date
  time: Time
  intention: string  // Can contain formatting codes
  donor: string
}

Announcement {
  id: string
  title: string
  text: string  // Can contain formatting codes
  order: number
}
```

### Formatting Rules

```javascript
function formatIntention(text) {
  // Handle @ for bold/italic
  if (text.startsWith('@')) {
    return { text: text.substring(1), bold: true, italic: true };
  }
  // Handle + for deceased
  text = text.replace(/\+/g, '†');
  return { text: text, bold: false, italic: false };
}

function formatAnnouncement(text) {
  // Handle + for deceased
  text = text.replace(/\+/g, '†');
  // Handle # for bullets
  text = text.replace(/#/g, '•');
  return text;
}

function formatDate(date) {
  // Output: "Mon 16 Feb"
  return date.format('ddd DD MMM');
}

function formatTime(time) {
  // Output: "9:00AM" or "1:00PM"
  return time.format('h:mmA');
}
```

### Layout Specifications

**Page 1 (Left Column)**
- Width: Approximately 4 columns (proportional)
- Header: "DIVINE LITURGY SCHEDULE" + Date
- Liturgy schedule in tabular format
- Horizontal separator line
- First N announcements

**Page 2 (Right Column)**
- Width: Approximately 4 columns (proportional)
- Remaining announcements
- Optional images

**Fonts**
- Schedule: Arial, configurable size
- Announcement titles: Verdana Bold, configurable size
- Announcement text: Arial, configurable size

---

## Testing Checklist for Replacement Application

### Basic Functionality
- [ ] Enter liturgy schedule data
- [ ] Enter announcements
- [ ] Set Sunday date
- [ ] Set number of page 1 announcements
- [ ] Format bulletin (automatic or on-demand)
- [ ] Print preview
- [ ] Print to PDF
- [ ] Print to printer

### Special Characters
- [ ] @ prefix creates bold/italic text
- [ ] + converts to † cross symbol
- [ ] # converts to • bullet symbol
- [ ] Special characters work in both intentions and announcements

### Text Wrapping
- [ ] Long intentions wrap to multiple lines
- [ ] Long announcement text wraps properly
- [ ] Text doesn't overflow page boundaries
- [ ] Line breaks are natural (at word boundaries)

### Layout
- [ ] Liturgy schedule appears in correct format
- [ ] Separator line appears after schedule
- [ ] First N announcements appear on page 1
- [ ] Remaining announcements appear on page 2
- [ ] Two-column layout is balanced

### Archive/History
- [ ] Save bulletin
- [ ] Load previous bulletin
- [ ] Browse bulletin archive
- [ ] Data persists between sessions

### Validation
- [ ] Invalid dates rejected
- [ ] Invalid times rejected or auto-corrected
- [ ] Required fields enforced
- [ ] Helpful error messages

### Edge Cases
- [ ] No liturgy entries (announcements only)
- [ ] No announcements (liturgy only)
- [ ] Very long bulletin (20+ entries)
- [ ] Empty intention field
- [ ] Special characters in donor names
- [ ] Multiple liturgies on same day

---

## Success Metrics

A successful replacement application should:

1. **Reduce errors**: No more forgotten Paste button, validation prevents bad input
2. **Save time**: Faster data entry, automatic formatting
3. **Increase reliability**: Works on any computer, no ActiveX issues
4. **Enable access**: Work from home, multiple users, cloud storage
5. **Maintain compatibility**: Preserve existing archive of bulletins
6. **Improve quality**: Better typography, consistent formatting

---

## Migration Strategy

### Phase 1: Parallel Operation
- Run both Excel and new system simultaneously
- Compare output for accuracy
- Build user confidence
- Duration: 4-8 weeks

### Phase 2: Primary System
- New system becomes primary
- Excel kept as backup
- Address any discovered issues
- Duration: 4-8 weeks

### Phase 3: Excel Retirement
- Archive Excel file
- Document kept for historical reference
- New system is sole production tool

### Data Migration
- Export existing bulletins from archive files
- Import into new system database
- Verify all historical data accessible

---

## Files and Resources

### Current System Files
- `StMike_Bulletin.xlsm` - Main workbook
- `FTPbulletin.bat` - FTP upload script
- `RestoreBulletin.bat` - Backup restore script
- Archive folder with `.bulletin` files

### Documentation Created
- `Bulletin_Spreadsheet_Analysis.md` - Initial analysis
- `StMike_Bulletin_Modernization_Guide.md` - VBA update instructions
- `Bulletin_Quick_Reference.md` - Daily workflow guide
- This document - Comprehensive project context

---

## Contact and Support

### Original System
- **Created by**: M112262 (per file metadata)
- **Organization**: St. Michael's Ukrainian Catholic Church
- **Last modified by**: St. Michaels

### Current Knowledge
- Full VBA source code extracted and documented
- All named ranges documented
- Workflow fully understood
- Modernization changes tested and working

---

## Next Steps for Replacement Development

1. **Choose technology stack**
   - Web app (React/Vue + Node.js/Python backend)
   - Desktop app (Electron, .NET, Python/Qt)
   - Mobile-first PWA

2. **Design database schema**
   - Based on data model above
   - Include audit trail for changes

3. **Create UI mockups**
   - Data entry screens
   - Preview/editing interface
   - Print layout

4. **Implement core features**
   - Data entry and validation
   - Formatting engine
   - PDF generation
   - Archive/history

5. **Testing with actual users**
   - User acceptance testing
   - Gather feedback
   - Iterate on design

6. **Deployment and training**
   - Install on church computer
   - Train users
   - Provide documentation

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Project Status**: Requirements gathering complete, ready for development
