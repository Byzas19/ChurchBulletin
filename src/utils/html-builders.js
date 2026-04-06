import { escHtml, fmtDateShort, fmtTime, fmtBulletinDate, processText, renderIntention } from './formatting.js';
import state from '../state/store.js';

export function buildScheduleHtml(sundayDate, schedFontSizeValue) {
  const hdrSize = parseFloat(schedFontSizeValue) + 1.5 + 'pt';
  let html =
    '<div class="bulletin-header" style="font-size:' +
    hdrSize +
    '">' +
    '<span>DIVINE LITURGY SCHEDULE</span>' +
    '<span class="header-date">' +
    escHtml(fmtBulletinDate(sundayDate)) +
    '</span>' +
    '</div>';
  html +=
    '<table class="sched-table"><colgroup>' +
    '<col style="width:' + state.colWidths.date + 'px">' +
    '<col style="width:' + state.colWidths.time + 'px">' +
    '<col>' +
    '<col style="width:' + state.colWidths.donor + 'px">' +
    '</colgroup>';
  for (let i = 0; i < state.schedule.length; i++) {
    const e = state.schedule[i];
    const prefixLines = e.prefix ? e.prefix.split('\\n') : [];
    if (prefixLines.length > 0 && e.prefix) {
      for (let li = 0; li < prefixLines.length; li++) {
        const line = prefixLines[li];
        const processed = processText(line);
        const isBold = line.startsWith('@');
        const displayText = isBold ? processed.substring(1) : processed;
        if (li === 0) {
          html +=
            '<tr><td style="padding-top:' + (i > 0 ? '3' : '0') + 'px">' +
            escHtml(fmtDateShort(e.date)) +
            '</td><td></td><td colspan="2" class="prefix-line">' +
            escHtml(displayText) + '</td></tr>';
        } else {
          html +=
            '<tr><td></td><td></td><td colspan="2" class="prefix-line">' +
            escHtml(displayText) + '</td></tr>';
        }
      }
      html +=
        '<tr><td></td><td>' + escHtml(fmtTime(e.time)) +
        '</td><td>' + renderIntention(e.intention) +
        '</td><td>' + escHtml(e.donor) + '</td></tr>';
    } else {
      html +=
        '<tr><td style="padding-top:' + (i > 0 ? '1' : '0') + 'px">' +
        escHtml(fmtDateShort(e.date)) +
        '</td><td>' + escHtml(fmtTime(e.time)) +
        '</td><td>' + renderIntention(e.intention) +
        '</td><td>' + escHtml(e.donor) + '</td></tr>';
    }
  }
  html += '</table><div class="sched-sep"></div>';
  return html;
}

export function buildAnnHtml(ann) {
  return (
    '<div class="ann-block"><div class="ann-title">' +
    escHtml(ann.title) +
    '</div><div>' +
    escHtml(processText(ann.text)) +
    '</div></div>'
  );
}
