import { MEASURE_CSS, MEASURE_FONT, COL_WIDTH } from '../data/defaults.js';

export function measureHtml(html) {
  const mc = document.getElementById('measureContainer');
  mc.innerHTML =
    '<style>' + MEASURE_CSS + '</style><div style="' + MEASURE_FONT + 'width:' + COL_WIDTH + 'px">' +
    html + '</div>';
  const h = mc.children[1].offsetHeight;
  mc.innerHTML = '';
  return h;
}
