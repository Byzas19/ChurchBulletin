import state from '../state/store.js';
import { escHtml } from '../utils/formatting.js';
import { moveItem } from './move-item.js';

export function renderAnnouncements() {
  const list = document.getElementById('annList');
  let html = '';
  for (let i = 0; i < state.announcements.length; i++) {
    const a = state.announcements[i];
    html +=
      '<div class="card" style="border-left:4px solid var(--gold)">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
      '<div style="font-size:10px;color:#8a7d6e;font-weight:600;flex:1">Announcement #' +
      (i + 1) +
      '</div>' +
      '<button class="btn-sm" data-ann-move="' +
      i +
      '" data-dir="-1">\u2191</button>' +
      '<button class="btn-sm" data-ann-move="' +
      i +
      '" data-dir="1">\u2193</button>' +
      '<button class="btn-sm del" data-ann-del="' +
      i +
      '">\u2715</button>' +
      '</div>' +
      '<div class="field" style="margin-bottom:6px"><label>Title</label><input type="text" value="' +
      escHtml(a.title) +
      '" data-ann-idx="' +
      i +
      '" data-ann-field="title" style="font-weight:700" placeholder="TITLE:"></div>' +
      '<div class="field"><label>Text</label><textarea rows="4" data-ann-idx="' +
      i +
      '" data-ann-field="text" placeholder="Announcement text...">' +
      escHtml(a.text) +
      '</textarea></div>' +
      '</div>';
  }
  list.innerHTML = html;
}

export function addAnnouncement() {
  state.announcements.push({ title: '', text: '' });
  renderAnnouncements();
  const list = document.getElementById('annList');
  if (list.lastElementChild)
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function wireAnnouncementEvents() {
  document.getElementById('annList').addEventListener('input', function (e) {
    const idx = e.target.dataset.annIdx;
    const field = e.target.dataset.annField;
    if (idx !== undefined && field) {
      state.announcements[parseInt(idx)][field] = e.target.value;
    }
  });
  document.getElementById('annList').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-ann-move]');
    if (btn) {
      moveItem(state.announcements, parseInt(btn.dataset.annMove), parseInt(btn.dataset.dir));
      renderAnnouncements();
      return;
    }
    const del = e.target.closest('[data-ann-del]');
    if (del) {
      state.announcements.splice(parseInt(del.dataset.annDel), 1);
      renderAnnouncements();
    }
  });
  document.getElementById('btnAddAnnouncement').addEventListener('click', addAnnouncement);
}
