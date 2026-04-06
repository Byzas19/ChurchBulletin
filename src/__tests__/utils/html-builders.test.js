import { describe, it, expect, beforeEach } from 'vitest';
import { buildScheduleHtml, buildAnnHtml } from '../../utils/html-builders.js';
import state from '../../state/store.js';

describe('buildScheduleHtml', () => {
  beforeEach(() => {
    // Reset state to a minimal schedule for predictable tests
    state.schedule = [
      { date: '2026-02-08', time: '09:00', intention: 'Intention of all Parishioners', donor: '', prefix: '' },
    ];
    state.colWidths = { date: 70, time: 55, donor: 85 };
  });

  it('includes the bulletin header with date', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('DIVINE LITURGY SCHEDULE');
    expect(html).toContain('2/8/2026');
  });

  it('sets header font size to schedFontSize + 1.5pt', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('font-size:11pt');
  });

  it('includes colgroup with column widths', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('width:70px');
    expect(html).toContain('width:55px');
    expect(html).toContain('width:85px');
  });

  it('renders schedule entries with formatted date and time', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('Sun 08 Feb');
    expect(html).toContain('9:00AM');
  });

  it('renders entries without prefix as single rows', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    // Should have exactly one <tr> for a single entry without prefix
    const trCount = (html.match(/<tr>/g) || []).length;
    expect(trCount).toBe(1);
  });

  it('renders prefix lines as separate rows', () => {
    state.schedule = [
      { date: '2026-02-02', time: '08:00', intention: '+Name', donor: 'Donor', prefix: 'Presentation\\nBlessing' },
    ];
    const html = buildScheduleHtml('2026-02-02', '9.5');
    // Should have 3 rows: prefix line 1, prefix line 2, data row
    const trCount = (html.match(/<tr>/g) || []).length;
    expect(trCount).toBe(3);
    expect(html).toContain('Presentation');
    expect(html).toContain('Blessing');
  });

  it('handles @-prefixed liturgical day notes', () => {
    state.schedule = [
      { date: '2026-02-08', time: '09:00', intention: 'Intention', donor: '', prefix: '@Sunday of Meat Fare' },
    ];
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('prefix-line');
    expect(html).toContain('Sunday of Meat Fare');
  });

  it('ends with schedule separator', () => {
    const html = buildScheduleHtml('2026-02-08', '9.5');
    expect(html).toContain('sched-sep');
  });
});

describe('buildAnnHtml', () => {
  it('wraps title in ann-title div', () => {
    const html = buildAnnHtml({ title: 'CCD CLASSES:', text: 'Some text here.' });
    expect(html).toContain('<div class="ann-title">CCD CLASSES:</div>');
  });

  it('wraps in ann-block div', () => {
    const html = buildAnnHtml({ title: 'Title', text: 'Text' });
    expect(html).toMatch(/^<div class="ann-block">/);
    expect(html).toMatch(/<\/div><\/div>$/);
  });

  it('processes + to dagger in text', () => {
    const html = buildAnnHtml({ title: 'Memorial', text: '+John Doe' });
    expect(html).toContain('\u2020John Doe');
  });

  it('processes # to bullet in text', () => {
    const html = buildAnnHtml({ title: 'List', text: '#Item one #Item two' });
    expect(html).toContain('\u2022Item one');
    expect(html).toContain('\u2022Item two');
  });

  it('escapes HTML in title and text', () => {
    const html = buildAnnHtml({ title: '<b>Bold</b>', text: 'A & B' });
    expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(html).toContain('A &amp; B');
  });
});
