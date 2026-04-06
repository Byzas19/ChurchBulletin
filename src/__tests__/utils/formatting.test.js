import { describe, it, expect } from 'vitest';
import {
  fmtDateShort,
  fmtTime,
  fmtBulletinDate,
  processText,
  escHtml,
  renderIntention,
} from '../../utils/formatting.js';

describe('fmtDateShort', () => {
  it('formats a date as "Day DD Mon"', () => {
    // 2026-02-02 is a Monday
    expect(fmtDateShort('2026-02-02')).toBe('Mon 02 Feb');
  });

  it('pads single-digit dates', () => {
    // 2026-02-08 is a Sunday
    expect(fmtDateShort('2026-02-08')).toBe('Sun 08 Feb');
  });

  it('returns empty string for empty input', () => {
    expect(fmtDateShort('')).toBe('');
    expect(fmtDateShort(null)).toBe('');
    expect(fmtDateShort(undefined)).toBe('');
  });

  it('handles different months', () => {
    expect(fmtDateShort('2026-12-25')).toMatch(/Fri 25 Dec/);
    expect(fmtDateShort('2026-01-01')).toMatch(/Thu 01 Jan/);
  });
});

describe('fmtTime', () => {
  it('converts 24h to 12h AM format', () => {
    expect(fmtTime('08:00')).toBe('8:00AM');
  });

  it('converts 24h to 12h PM format', () => {
    expect(fmtTime('16:00')).toBe('4:00PM');
  });

  it('handles noon', () => {
    expect(fmtTime('12:00')).toBe('12:00PM');
  });

  it('handles midnight', () => {
    expect(fmtTime('00:00')).toBe('12:00AM');
  });

  it('preserves minutes', () => {
    expect(fmtTime('09:30')).toBe('9:30AM');
    expect(fmtTime('14:05')).toBe('2:05PM');
  });

  it('returns empty string for empty input', () => {
    expect(fmtTime('')).toBe('');
    expect(fmtTime(null)).toBe('');
    expect(fmtTime(undefined)).toBe('');
  });
});

describe('fmtBulletinDate', () => {
  it('formats as m/d/yyyy', () => {
    expect(fmtBulletinDate('2026-02-08')).toBe('2/8/2026');
  });

  it('does not zero-pad month or day', () => {
    expect(fmtBulletinDate('2026-01-05')).toBe('1/5/2026');
  });

  it('returns empty string for empty input', () => {
    expect(fmtBulletinDate('')).toBe('');
  });
});

describe('processText', () => {
  it('replaces + with dagger symbol', () => {
    expect(processText('+Maria')).toBe('\u2020Maria');
  });

  it('replaces multiple + signs', () => {
    expect(processText('+Evhenia +Roman +Maria')).toBe('\u2020Evhenia \u2020Roman \u2020Maria');
  });

  it('replaces # with bullet', () => {
    expect(processText('#Item one')).toBe('\u2022Item one');
  });

  it('handles both + and # in same text', () => {
    expect(processText('+Name #note')).toBe('\u2020Name \u2022note');
  });

  it('returns empty string for null/undefined', () => {
    expect(processText(null)).toBe('');
    expect(processText(undefined)).toBe('');
    expect(processText('')).toBe('');
  });

  it('returns plain text unchanged if no special chars', () => {
    expect(processText('Hello World')).toBe('Hello World');
  });
});

describe('escHtml', () => {
  it('escapes angle brackets', () => {
    expect(escHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes ampersands', () => {
    expect(escHtml('A & B')).toBe('A &amp; B');
  });

  it('leaves plain text unchanged', () => {
    expect(escHtml('Hello World')).toBe('Hello World');
  });
});

describe('renderIntention', () => {
  it('returns empty string for falsy input', () => {
    expect(renderIntention('')).toBe('');
    expect(renderIntention(null)).toBe('');
    expect(renderIntention(undefined)).toBe('');
  });

  it('processes + to dagger and escapes HTML', () => {
    const result = renderIntention('+Maria');
    expect(result).toContain('\u2020Maria');
    // Should not contain raw HTML tags from the input
    expect(result).not.toContain('<script');
  });

  it('wraps @-prefixed text in bold italic span', () => {
    const result = renderIntention('@Sunday of Meat Fare');
    expect(result).toContain('font-weight:700');
    expect(result).toContain('font-style:italic');
    expect(result).toContain('Sunday of Meat Fare');
    // The @ should be stripped
    expect(result).not.toContain('@Sunday');
  });

  it('returns escaped text for regular intentions', () => {
    const result = renderIntention('Private Intention');
    expect(result).toBe('Private Intention');
  });

  it('handles @ with + in text', () => {
    const result = renderIntention('@1st All Souls Saturday');
    expect(result).toContain('font-weight:700');
    expect(result).toContain('1st All Souls Saturday');
  });
});
