/**
 * Default data constants and factory functions.
 */

export const DEFAULT_COL_WIDTHS = { date: 70, time: 55, donor: 85 };

export const DEFAULT_SECTION_MARGINS = {
  leftOuter: 20,
  leftInner: 14,
  rightInner: 14,
  rightOuter: 20,
};

export const DEFAULT_BACK_COVER = {
  churchName: 'St. Michael Ukrainian Catholic Church',
  address1: '35 ALLEN STREET',
  address2: 'TERRYVILLE, CT.  06786',
  priestLabel: 'Parish Priest:',
  priestName: 'Fr. Paul Luniw  J.C.D., S.T.L,  S.R.N',
  phoneLabel: 'Telephone:',
  phone: '(860) 583-7588',
  faxLabel: 'Fax:',
  fax: '(860) 516-4896',
  emailLabel: 'Email:',
  email: 'st-michaels@comcast.net',
  websiteLabel: 'Parish Website:',
  website: 'www.stmichaelsterryville.org',
};

export const SAMPLE_SCHEDULE = [
  {
    date: '2026-02-02',
    time: '08:00',
    intention: '+Jaroslaw Czerwoniak',
    donor: 'K Czerwoniak',
    prefix: 'Presentation in the Temple\\nBlessing of Candles',
  },
  { date: '2026-02-03', time: '', intention: 'Private Intention', donor: 'N/N', prefix: '' },
  {
    date: '2026-02-04',
    time: '',
    intention: '+Evhenia +Roman +Maria Brykowytch',
    donor: 'K Czerwoniak',
    prefix: '',
  },
  {
    date: '2026-02-06',
    time: '',
    intention: 'Intention of Fr. Weaver and Fr. Estrada',
    donor: 'M Stefanczyk',
    prefix: '',
  },
  {
    date: '2026-02-07',
    time: '08:00',
    intention: 'Health',
    donor: 'N/N',
    prefix: '@1st All Souls Saturday\\nSorokousty',
  },
  {
    date: '2026-02-07',
    time: '16:00',
    intention: 'Health of Luba Koziupa Weselyj',
    donor: 'L Koziupa',
    prefix: '',
  },
  {
    date: '2026-02-08',
    time: '09:00',
    intention: 'Intention of all Parishioners',
    donor: '',
    prefix: '@Sunday of Meat Fare',
  },
  { date: '2026-02-09', time: '', intention: '+Ray Bendt', donor: 'M Bendt', prefix: '' },
  {
    date: '2026-02-10',
    time: '',
    intention: '+Mary Anna Bobyk',
    donor: 'J Golnik',
    prefix: '',
  },
  {
    date: '2026-02-15',
    time: '09:00',
    intention: 'Intention of all Parishioners',
    donor: '',
    prefix: '@Sunday of Cheesefare',
  },
];

export const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'CCD CLASSES:',
    text: 'Continue today (weather permitting) after the 9.00 am Divine Liturgy.',
  },
  {
    title: 'COFFEE AND CAKE:',
    text: 'Today (weather permitting) after the 9.00 am Divine Liturgy and will continue every second week. Please sign the sheet and offer to help as you have done in the past.',
  },
  {
    title: 'USHERS:',
    text: 'Please sign the sheet and offer your services if you are able to do so.',
  },
  { title: 'HOUSE BLESSINGS 2026:', text: 'Will continue this week.' },
  {
    title: 'SOROKOUSTY:',
    text: 'We begin celebrating Sorokousty on Saturday February 7, 2026. This is the first of our five Saturdays. Please remember that our deceased loved ones cannot pray for themselves, only we can. If you would like me to remember your deceased loved ones, submit your names this week. Special envelopes are available in the vestibule of the church.',
  },
  {
    title: 'SATURDAY LITURGIES:',
    text: 'There will be no Saturday evening Liturgies on February 14th and February 21st, 2026. I will be going into hospital on February 11, 2026 for surgery. After the operation, I will need time to recover. Please remember me in your prayers. Thank you',
  },
];

// Measurement constants for the overflow balancing algorithm
export const MEASURE_CSS =
  '.ann-block{margin-bottom:12px} .ann-title{font-family:Verdana,Geneva,sans-serif;font-weight:700} .bulletin-header{background:#d9d9d9;font-weight:700;padding:4px 10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center} .prefix-line{font-weight:700;font-style:italic} .sched-sep{border-top:1.5px solid #000;margin:6px 0} table{border-collapse:collapse;width:100%} td{vertical-align:top;padding:1px 2px} .left-ann-section{margin-top:2px}';

export const MEASURE_FONT =
  'font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;line-height:1.38;';

export const COL_WIDTH = 280;
