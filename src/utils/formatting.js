/**
 * Pure text formatting functions for bulletin content.
 * No DOM dependencies — fully testable with plain assertions.
 */

export function fmtDateShort(ds) {
  if (!ds) return '';
  const d = new Date(ds + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + ' ' + mons[d.getMonth()];
}

export function fmtTime(ts) {
  if (!ts) return '';
  const parts = ts.split(':');
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const a = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return h12 + ':' + String(m).padStart(2, '0') + a;
}

export function fmtBulletinDate(ds) {
  if (!ds) return '';
  const d = new Date(ds + 'T12:00:00');
  return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
}

export function processText(t) {
  return (t || '').replace(/\+/g, '\u2020').replace(/#/g, '\u2022');
}

export function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function renderIntention(text) {
  if (!text) return '';
  const processed = processText(text);
  if (text.startsWith('@'))
    return (
      '<span style="font-weight:700;font-style:italic">' +
      escHtml(processed.substring(1)) +
      '</span>'
    );
  return escHtml(processed);
}
