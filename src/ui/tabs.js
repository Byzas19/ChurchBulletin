import state from '../state/store.js';

// Forward references — set by main.js to avoid circular imports
let onPreviewFront = null;
let onPreviewBack = null;

export function setPreviewCallbacks(frontFn, backFn) {
  onPreviewFront = frontFn;
  onPreviewBack = backFn;
}

export function switchPreviewPage(page) {
  state.previewPage = page;
  document.getElementById('prevPageFront').classList.toggle('active', page === 'front');
  document.getElementById('prevPageBack').classList.toggle('active', page === 'back');
  if (page === 'front') {
    if (onPreviewFront) onPreviewFront();
  } else {
    if (onPreviewBack) onPreviewBack();
  }
}

export function switchTab(tab) {
  const tabs = ['schedule', 'announcements', 'backcover', 'pictures', 'preview'];
  const ids = ['scheduleTab', 'announcementsTab', 'backcoverTab', 'picturesTab', 'previewTab'];
  const btns = ['tabSchedule', 'tabAnnouncements', 'tabBackCover', 'tabPictures', 'tabPreview'];
  for (let i = 0; i < tabs.length; i++) {
    document.getElementById(ids[i]).classList.toggle('hidden', tabs[i] !== tab);
    document.getElementById(btns[i]).classList.toggle('active', tabs[i] === tab);
  }
  if (tab === 'preview') {
    if (state.previewPage === 'back') {
      if (onPreviewBack) onPreviewBack();
    } else {
      if (onPreviewFront) onPreviewFront();
    }
  }
}
