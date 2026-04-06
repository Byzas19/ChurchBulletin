/**
 * Mutable application state.
 * Wrapped in an object so imports get live references.
 */

import {
  DEFAULT_COL_WIDTHS,
  DEFAULT_SECTION_MARGINS,
  DEFAULT_BACK_COVER,
  SAMPLE_SCHEDULE,
  SAMPLE_ANNOUNCEMENTS,
} from '../data/defaults.js';

const state = {
  colWidths: { ...DEFAULT_COL_WIDTHS },
  sectionMargins: { ...DEFAULT_SECTION_MARGINS },
  backCover: { ...DEFAULT_BACK_COVER },
  schedule: SAMPLE_SCHEDULE.map((e) => ({ ...e })),
  announcements: SAMPLE_ANNOUNCEMENTS.map((a) => ({ ...a })),
  pictures: [],
  picIdCounter: 0,
  previewPage: 'front',
};

export default state;
