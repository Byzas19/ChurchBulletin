import state from '../state/store.js';
import { escHtml } from '../utils/formatting.js';

export function handleImageUpload(event) {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    (function (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        state.pictures.push({
          id: ++state.picIdCounter,
          name: file.name,
          dataUrl: e.target.result,
          xPct: state.pictures.length % 2 === 0 ? 5 : 55,
          yPct: 70,
          wPx: 120,
          hPx: 100,
        });
        renderPicGallery();
      };
      reader.readAsDataURL(file);
    })(files[i]);
  }
  event.target.value = '';
}

export function renderPicGallery() {
  const gal = document.getElementById('picGallery');
  if (state.pictures.length === 0) {
    gal.innerHTML =
      '<div style="text-align:center;color:#bbb;padding:16px;font-size:13px">No images uploaded yet</div>';
    return;
  }
  let html = '';
  for (let i = 0; i < state.pictures.length; i++) {
    const p = state.pictures[i];
    html +=
      '<div class="pic-item">' +
      '<button class="pic-remove" data-pic-remove="' + p.id + '">\u00d7</button>' +
      '<img class="pic-thumb" src="' + p.dataUrl + '" alt="' + escHtml(p.name) + '">' +
      '<span class="pic-label">' + escHtml(p.name) + '</span>' +
      '</div>';
  }
  gal.innerHTML = html;
}

export function removePicture(id) {
  state.pictures = state.pictures.filter(function (p) {
    return p.id !== id;
  });
  renderPicGallery();
}

export function wirePictureEvents() {
  document.getElementById('imageUploadInput').addEventListener('change', handleImageUpload);
  document.getElementById('picGallery').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-pic-remove]');
    if (btn) {
      removePicture(parseInt(btn.dataset.picRemove));
    }
  });
}
