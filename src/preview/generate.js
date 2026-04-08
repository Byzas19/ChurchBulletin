import state from '../state/store.js';
import { escHtml } from '../utils/formatting.js';
import { buildScheduleHtml, buildAnnHtml } from '../utils/html-builders.js';
import { measureHtml } from '../utils/measure.js';
import { getSchedFontSize, getAnnFontSize, getSchedFontSizeValue } from '../ui/font-sizes.js';
import { addDraggableImage } from './draggable-images.js';
import { setupColumnResizers, setupMarginHandles } from './resize-handles.js';

export function generatePreview() {
  const sundayDate = document.getElementById('sundayDate').value;
  const schedFontSize = getSchedFontSize();
  const annFontSize = getAnnFontSize();

  const schedHtml = buildScheduleHtml(sundayDate, getSchedFontSizeValue());
  const annBlocks = [];
  for (let i = 0; i < state.announcements.length; i++)
    annBlocks.push(buildAnnHtml(state.announcements[i]));

  const schedHeight = measureHtml(schedHtml);
  const annHeights = [];
  for (let j = 0; j < annBlocks.length; j++) annHeights.push(measureHtml(annBlocks[j]));

  let splitIndex = annBlocks.length;
  function rightHeight(si) {
    let h = 0;
    for (let k = 0; k < si; k++) h += annHeights[k];
    return h;
  }
  function leftHeight(si) {
    let h = schedHeight;
    for (let k = si; k < annBlocks.length; k++) h += annHeights[k];
    return h;
  }
  while (splitIndex > 0 && rightHeight(splitIndex) > leftHeight(splitIndex)) splitIndex--;

  let rightHtml = '';
  for (let r = 0; r < splitIndex; r++) rightHtml += annBlocks[r];

  let overflowAnnHtml = '';
  if (splitIndex < annBlocks.length) {
    for (let l = splitIndex; l < annBlocks.length; l++) overflowAnnHtml += annBlocks[l];
  }

  const previewBox = document.getElementById('previewBox');
  const sm = state.sectionMargins;
  previewBox.innerHTML =
    '<div class="bulletin" id="bulletinContent">' +
    '<div class="col-left" style="padding:0 ' +
    sm.leftInner +
    'px 0 ' +
    sm.leftOuter +
    'px">' +
    '<div style="font-size:' +
    schedFontSize +
    '">' +
    schedHtml +
    '</div>' +
    (overflowAnnHtml
      ? '<div class="left-ann-section" style="font-size:' +
        annFontSize +
        '">' +
        overflowAnnHtml +
        '</div>'
      : '') +
    '</div>' +
    '<div class="col-right" style="padding:0 ' +
    sm.rightOuter +
    'px 0 ' +
    sm.rightInner +
    'px;font-size:' +
    annFontSize +
    '">' +
    rightHtml +
    '</div>' +
    '</div>';

  for (let p = 0; p < state.pictures.length; p++) {
    addDraggableImage(state.pictures[p]);
  }

  const info = document.getElementById('layoutInfo');
  const overflowCount = annBlocks.length - splitIndex;
  if (overflowCount > 0) {
    info.textContent =
      '\uD83D\uDCCF ' +
      splitIndex +
      ' announcement(s) right, ' +
      overflowCount +
      ' overflow left. ' +
      state.pictures.length +
      ' image(s).';
  } else {
    info.textContent =
      '\uD83D\uDCCF All ' +
      state.announcements.length +
      ' announcement(s) on right. ' +
      state.pictures.length +
      ' image(s).';
  }
  info.classList.remove('hidden');

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      setupColumnResizers();
      setupMarginHandles();
    });
  });
}

export function generateBackCoverPreview() {
  const previewBox = document.getElementById('previewBox');
  const bc = state.backCover;
  previewBox.innerHTML =
    '<div class="backcover-preview" id="bulletinContent">' +
    '<div class="bc-box" style="width:50%;height:50%">' +
    '<div class="bc-church-name">' +
    escHtml(bc.churchName) +
    '</div>' +
    '<div class="bc-address">' +
    escHtml(bc.address1) +
    '<br>' +
    escHtml(bc.address2) +
    '</div>' +
    '<div class="bc-contacts">' +
    '<div><span class="bc-label">' +
    escHtml(bc.priestLabel) +
    '</span> <span class="bc-value">' +
    escHtml(bc.priestName) +
    '</span></div>' +
    '<div><span class="bc-label">' +
    escHtml(bc.phoneLabel) +
    '</span> <span class="bc-value">' +
    escHtml(bc.phone) +
    '</span></div>' +
    '<div><span class="bc-label">' +
    escHtml(bc.faxLabel) +
    '</span> <span class="bc-value">' +
    escHtml(bc.fax) +
    '</span></div>' +
    '<div><span class="bc-label">' +
    escHtml(bc.emailLabel) +
    '</span> <span class="bc-value">' +
    escHtml(bc.email) +
    '</span></div>' +
    '<div><span class="bc-label">' +
    escHtml(bc.websiteLabel) +
    '</span> <span class="bc-value">' +
    escHtml(bc.website) +
    '</span></div>' +
    '</div>' +
    '</div>' +
    '</div>';

  const info = document.getElementById('layoutInfo');
  info.classList.add('hidden');
}
