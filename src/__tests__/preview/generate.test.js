import { describe, it, expect, beforeEach, vi } from 'vitest';
import state from '../../state/store.js';
import { DEFAULT_COL_WIDTHS, DEFAULT_SECTION_MARGINS } from '../../data/defaults.js';

// We test the overflow balancing algorithm by mocking measureHtml to return
// deterministic heights, then checking how the preview distributes announcements.

describe('generatePreview overflow balancing', () => {
  beforeEach(() => {
    // Set up the DOM that generatePreview needs
    document.body.innerHTML = `
      <input id="sundayDate" value="2026-02-08" />
      <select id="schedFontSize"><option value="9.5" selected>9.5pt</option></select>
      <select id="annFontSize"><option value="9.5" selected>9.5pt</option></select>
      <div id="previewBox"></div>
      <div id="layoutInfo" class="hidden"></div>
      <div id="measureContainer"></div>
    `;

    state.schedule = [
      { date: '2026-02-08', time: '09:00', intention: 'Test', donor: '', prefix: '' },
    ];
    state.colWidths = { ...DEFAULT_COL_WIDTHS };
    state.sectionMargins = { ...DEFAULT_SECTION_MARGINS };
    state.pictures = [];
  });

  it('places all announcements on right when they fit', async () => {
    state.announcements = [
      { title: 'A1', text: 'Short' },
      { title: 'A2', text: 'Also short' },
    ];

    // Mock measureHtml to return small heights
    const measure = await import('../../utils/measure.js');
    vi.spyOn(measure, 'measureHtml').mockImplementation((html) => {
      if (html.includes('sched-table')) return 200; // schedule height
      return 50; // each announcement = 50px
    });

    const { generatePreview } = await import('../../preview/generate.js');
    generatePreview();

    const info = document.getElementById('layoutInfo');
    expect(info.textContent).toContain('All 2 announcement(s) on right');

    vi.restoreAllMocks();
  });

  it('overflows announcements to left when right column is too tall', async () => {
    state.announcements = [
      { title: 'A1', text: 'Long text' },
      { title: 'A2', text: 'Long text' },
      { title: 'A3', text: 'Long text' },
      { title: 'A4', text: 'Long text' },
      { title: 'A5', text: 'Long text' },
    ];

    const measure = await import('../../utils/measure.js');
    vi.spyOn(measure, 'measureHtml').mockImplementation((html) => {
      if (html.includes('sched-table')) return 100; // short schedule
      return 80; // each announcement = 80px (5 * 80 = 400 > schedule 100)
    });

    const { generatePreview } = await import('../../preview/generate.js');
    generatePreview();

    const info = document.getElementById('layoutInfo');
    expect(info.textContent).toContain('overflow left');

    // Verify the preview has both columns with content
    const previewBox = document.getElementById('previewBox');
    const leftAnnSection = previewBox.querySelector('.left-ann-section');
    expect(leftAnnSection).toBeTruthy();

    vi.restoreAllMocks();
  });

  it('shows image count in layout info', async () => {
    state.announcements = [{ title: 'A1', text: 'Short' }];
    state.pictures = [
      {
        id: 1,
        name: 'test.png',
        dataUrl: 'data:image/png;base64,abc',
        xPct: 5,
        yPct: 70,
        wPx: 120,
        hPx: 100,
      },
    ];

    const measure = await import('../../utils/measure.js');
    vi.spyOn(measure, 'measureHtml').mockReturnValue(50);

    const { generatePreview } = await import('../../preview/generate.js');
    generatePreview();

    const info = document.getElementById('layoutInfo');
    expect(info.textContent).toContain('1 image(s)');

    vi.restoreAllMocks();
  });
});
