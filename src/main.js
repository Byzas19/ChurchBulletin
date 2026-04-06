import './styles.css';

// UI modules
import { switchTab, switchPreviewPage, setPreviewCallbacks } from './ui/tabs.js';
import { renderSchedule, wireScheduleEvents } from './ui/schedule-tab.js';
import { renderAnnouncements, wireAnnouncementEvents } from './ui/announcements-tab.js';
import { renderPicGallery, wirePictureEvents } from './ui/pictures-tab.js';
import { renderBackCover, wireBackCoverEvents } from './ui/backcover-tab.js';

// Preview
import { generatePreview, generateBackCoverPreview } from './preview/generate.js';

// Export
import { exportPDF } from './export/pdf.js';
import { exportData, importData, clearAll } from './export/save-load.js';

// Wire the preview callbacks to avoid circular imports between tabs.js and generate.js
setPreviewCallbacks(generatePreview, generateBackCoverPreview);

// ── Toolbar ──
document.getElementById('loadFileInput').addEventListener('change', importData);
document.getElementById('btnSave').addEventListener('click', exportData);
document.getElementById('btnClear').addEventListener('click', clearAll);
document.getElementById('btnExport').addEventListener('click', exportPDF);
document.getElementById('schedFontSize').addEventListener('change', function () {
  const previewBox = document.getElementById('previewBox');
  if (previewBox && previewBox.querySelector('.bulletin')) {
    generatePreview();
  }
});
document.getElementById('annFontSize').addEventListener('change', function () {
  const previewBox = document.getElementById('previewBox');
  if (previewBox && previewBox.querySelector('.bulletin')) {
    generatePreview();
  }
});

// ── Tab buttons ──
document.getElementById('tabSchedule').addEventListener('click', function () { switchTab('schedule'); });
document.getElementById('tabAnnouncements').addEventListener('click', function () { switchTab('announcements'); });
document.getElementById('tabBackCover').addEventListener('click', function () { switchTab('backcover'); });
document.getElementById('tabPictures').addEventListener('click', function () { switchTab('pictures'); });
document.getElementById('tabPreview').addEventListener('click', function () { switchTab('preview'); });

// ── Preview page toggle ──
document.getElementById('prevPageFront').addEventListener('click', function () { switchPreviewPage('front'); });
document.getElementById('prevPageBack').addEventListener('click', function () { switchPreviewPage('back'); });

// ── Delegated events for dynamic content ──
wireScheduleEvents();
wireAnnouncementEvents();
wirePictureEvents();
wireBackCoverEvents();

// ── Init ──
renderSchedule();
renderAnnouncements();
renderPicGallery();
renderBackCover();
