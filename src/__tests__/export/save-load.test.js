import { describe, it, expect, beforeEach, vi } from 'vitest';
import state from '../../state/store.js';
import {
  DEFAULT_COL_WIDTHS,
  DEFAULT_SECTION_MARGINS,
  DEFAULT_BACK_COVER,
} from '../../data/defaults.js';

describe('exportData serialization', () => {
  beforeEach(() => {
    // Set up minimal DOM elements that exportData reads
    document.body.innerHTML = `
      <input id="sundayDate" value="2026-02-08" />
      <select id="schedFontSize"><option value="9.5" selected>9.5pt</option></select>
      <select id="annFontSize"><option value="9.5" selected>9.5pt</option></select>
    `;

    // Reset state
    state.schedule = [
      { date: '2026-02-08', time: '09:00', intention: 'Test', donor: 'D', prefix: '' },
    ];
    state.announcements = [{ title: 'T', text: 'Body' }];
    state.pictures = [];
    state.colWidths = { ...DEFAULT_COL_WIDTHS };
    state.sectionMargins = { ...DEFAULT_SECTION_MARGINS };
    state.backCover = { ...DEFAULT_BACK_COVER };
  });

  it('produces a valid JSON structure with all expected keys', async () => {
    // Import dynamically so module-level DOM reads happen after our setup
    const { exportData } = await import('../../export/save-load.js');

    // Mock URL.createObjectURL / revokeObjectURL and anchor click
    let capturedBlob = null;
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob) => {
      capturedBlob = blob;
      return 'blob:test';
    };
    URL.revokeObjectURL = () => {};

    // Mock the anchor click so it doesn't actually download
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {};

    try {
      exportData();

      expect(capturedBlob).toBeTruthy();
      const text = await capturedBlob.text();
      const data = JSON.parse(text);

      expect(data.sundayDate).toBe('2026-02-08');
      expect(data.schedule).toHaveLength(1);
      expect(data.schedule[0].intention).toBe('Test');
      expect(data.announcements).toHaveLength(1);
      expect(data.pictures).toEqual([]);
      expect(data.colWidths).toEqual(DEFAULT_COL_WIDTHS);
      expect(data.sectionMargins).toEqual(DEFAULT_SECTION_MARGINS);
      expect(data.schedFontSize).toBe('9.5');
      expect(data.annFontSize).toBe('9.5');
      expect(data.backCover.churchName).toBe('St. Michael Ukrainian Catholic Church');
    } finally {
      URL.createObjectURL = origCreate;
      URL.revokeObjectURL = origRevoke;
      HTMLAnchorElement.prototype.click = origClick;
    }
  });
});

describe('clearAll', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="sundayDate" value="2026-02-08" />
      <select id="schedFontSize"><option value="9.5" selected>9.5pt</option></select>
      <select id="annFontSize"><option value="9.5" selected>9.5pt</option></select>
      <div id="scheduleList"></div>
      <div id="annList"></div>
      <div id="picGallery"></div>
      <div id="previewBox"></div>
      <div class="tabs"><button class="active">Tab</button></div>
    `;

    state.schedule = [
      { date: '2026-02-08', time: '09:00', intention: 'Test', donor: 'D', prefix: '' },
      { date: '2026-02-09', time: '', intention: 'Test2', donor: 'D2', prefix: '' },
    ];
    state.announcements = [
      { title: 'A', text: 'B' },
      { title: 'C', text: 'D' },
    ];
    state.pictures = [
      { id: 1, name: 'test.png', dataUrl: 'data:test', xPct: 5, yPct: 70, wPx: 120, hPx: 100 },
    ];
  });

  it('resets state to single empty entries and clears pictures', async () => {
    const { clearAll } = await import('../../export/save-load.js');

    // happy-dom may not define confirm, so assign it directly
    window.confirm = vi.fn(() => true);

    clearAll();

    expect(state.schedule).toHaveLength(1);
    expect(state.schedule[0].date).toBe('');
    expect(state.schedule[0].intention).toBe('');
    expect(state.announcements).toHaveLength(1);
    expect(state.announcements[0].title).toBe('');
    expect(state.pictures).toEqual([]);

    vi.restoreAllMocks();
  });

  it('does nothing when user cancels confirmation', async () => {
    const { clearAll } = await import('../../export/save-load.js');

    window.confirm = vi.fn(() => false);

    clearAll();

    // State should be unchanged
    expect(state.schedule).toHaveLength(2);
    expect(state.announcements).toHaveLength(2);
    expect(state.pictures).toHaveLength(1);

    vi.restoreAllMocks();
  });
});
