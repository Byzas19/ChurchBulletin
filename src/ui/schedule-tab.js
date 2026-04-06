import state from '../state/store.js';
import { escHtml } from '../utils/formatting.js';
import { moveItem } from './move-item.js';

export function renderSchedule() {
  const list = document.getElementById('scheduleList');
  let html = '';
  for (let i = 0; i < state.schedule.length; i++) {
    const r = state.schedule[i];
    const bg = i % 2 === 0 ? 'background:#fdfbf7' : '';
    html +=
      '<div class="card" style="' + bg + '"><div class="card-row">' +
      '<div class="field" style="flex:0 0 132px"><label>Date</label><input type="date" value="' +
      r.date + '" data-sched-idx="' + i + '" data-sched-field="date"></div>' +
      '<div class="field" style="flex:0 0 95px"><label>Time</label><input type="time" value="' +
      r.time + '" data-sched-idx="' + i + '" data-sched-field="time"></div>' +
      '<div class="field" style="flex:1;min-width:180px"><label>Intention</label><input type="text" value="' +
      escHtml(r.intention) + '" data-sched-idx="' + i + '" data-sched-field="intention" placeholder="+Maria or @First Sunday..."></div>' +
      '<div class="field" style="flex:0 0 120px"><label>Donor</label><input type="text" value="' +
      escHtml(r.donor) + '" data-sched-idx="' + i + '" data-sched-field="donor" placeholder="Donor"></div>' +
      '</div><div class="card-row" style="align-items:flex-end">' +
      '<div class="field" style="flex:1"><label>Day Note (e.g. "@Sunday of Meat Fare"; use \\n for line break)</label><input type="text" value="' +
      escHtml(r.prefix) + '" data-sched-idx="' + i + '" data-sched-field="prefix" placeholder="Optional liturgical note"></div>' +
      '<div style="display:flex;gap:3px">' +
      '<button class="btn-sm" data-sched-move="' + i + '" data-dir="-1">\u2191</button>' +
      '<button class="btn-sm" data-sched-move="' + i + '" data-dir="1">\u2193</button>' +
      '<button class="btn-sm del" data-sched-del="' + i + '">\u2715</button>' +
      '</div></div></div>';
  }
  list.innerHTML = html;
}

export function addScheduleRow() {
  state.schedule.push({ date: '', time: '', intention: '', donor: '', prefix: '' });
  renderSchedule();
  const list = document.getElementById('scheduleList');
  if (list.lastElementChild)
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function wireScheduleEvents() {
  document.getElementById('scheduleList').addEventListener('input', function (e) {
    const idx = e.target.dataset.schedIdx;
    const field = e.target.dataset.schedField;
    if (idx !== undefined && field) {
      state.schedule[parseInt(idx)][field] = e.target.value;
    }
  });
  document.getElementById('scheduleList').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-sched-move]');
    if (btn) {
      moveItem(state.schedule, parseInt(btn.dataset.schedMove), parseInt(btn.dataset.dir));
      renderSchedule();
      return;
    }
    const del = e.target.closest('[data-sched-del]');
    if (del) {
      state.schedule.splice(parseInt(del.dataset.schedDel), 1);
      renderSchedule();
    }
  });
  document.getElementById('btnAddSchedule').addEventListener('click', addScheduleRow);
}
