import state from '../state/store.js';
import { renderSchedule } from '../ui/schedule-tab.js';
import { renderAnnouncements } from '../ui/announcements-tab.js';
import { renderPicGallery } from '../ui/pictures-tab.js';
import { renderBackCover } from '../ui/backcover-tab.js';

export function exportData() {
  const data = {
    sundayDate: document.getElementById('sundayDate').value,
    schedule: state.schedule,
    announcements: state.announcements,
    pictures: state.pictures,
    colWidths: state.colWidths,
    sectionMargins: state.sectionMargins,
    schedFontSize: document.getElementById('schedFontSize').value,
    annFontSize: document.getElementById('annFontSize').value,
    backCover: state.backCover,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/octet-stream',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bulletin_' + data.sundayDate + '.bulletin';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.sundayDate) document.getElementById('sundayDate').value = data.sundayDate;
      if (data.schedule) state.schedule = data.schedule;
      if (data.announcements) state.announcements = data.announcements;
      if (data.pictures) {
        state.pictures = data.pictures;
        state.picIdCounter = Math.max.apply(
          null,
          state.pictures
            .map(function (p) {
              return p.id;
            })
            .concat([0]),
        );
      }
      if (data.colWidths) state.colWidths = data.colWidths;
      if (data.sectionMargins) state.sectionMargins = data.sectionMargins;
      if (data.schedFontSize) document.getElementById('schedFontSize').value = data.schedFontSize;
      if (data.annFontSize) document.getElementById('annFontSize').value = data.annFontSize;
      if (data.backCover) {
        for (const k in data.backCover) {
          if (Object.prototype.hasOwnProperty.call(data.backCover, k))
            state.backCover[k] = data.backCover[k];
        }
      }
      renderSchedule();
      renderAnnouncements();
      renderPicGallery();
      renderBackCover();
      const activeTab = document.querySelector('.tabs button.active');
      if (activeTab) activeTab.click();
    } catch (_err) {
      alert('Invalid bulletin file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

export function clearAll() {
  if (!confirm('Clear all data? This cannot be undone.')) return;
  state.schedule = [{ date: '', time: '', intention: '', donor: '', prefix: '' }];
  state.announcements = [{ title: '', text: '' }];
  state.pictures = [];
  renderSchedule();
  renderAnnouncements();
  renderPicGallery();
  document.getElementById('previewBox').innerHTML =
    '<div class="preview-empty">Click the <strong>Preview</strong> tab to generate the bulletin.</div>';
}
