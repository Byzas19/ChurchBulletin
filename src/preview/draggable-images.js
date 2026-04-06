import { removePicture } from '../ui/pictures-tab.js';

export function addDraggableImage(pic) {
  const container = document.getElementById('bulletinContent');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'bull-img';
  wrapper.setAttribute('data-pic-id', pic.id);
  wrapper.style.left = pic.xPct + '%';
  wrapper.style.top = pic.yPct + '%';
  wrapper.style.width = pic.wPx + 'px';
  wrapper.style.height = pic.hPx + 'px';

  const img = document.createElement('img');
  img.src = pic.dataUrl;
  wrapper.appendChild(img);

  const resizer = document.createElement('div');
  resizer.className = 'img-resize';
  wrapper.appendChild(resizer);

  const delBtn = document.createElement('button');
  delBtn.className = 'img-delete';
  delBtn.textContent = '\u00d7';
  delBtn.onclick = function (ev) {
    ev.stopPropagation();
    removePicture(pic.id);
    wrapper.remove();
  };
  wrapper.appendChild(delBtn);

  let dragging = false,
    resizing = false,
    startX,
    startY,
    origLeft,
    origTop,
    origW,
    origH;

  wrapper.addEventListener('mousedown', function (ev) {
    if (ev.target === resizer) return;
    ev.preventDefault();
    dragging = true;
    startX = ev.clientX;
    startY = ev.clientY;
    origLeft = wrapper.offsetLeft;
    origTop = wrapper.offsetTop;
  });
  resizer.addEventListener('mousedown', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    resizing = true;
    startX = ev.clientX;
    startY = ev.clientY;
    origW = wrapper.offsetWidth;
    origH = wrapper.offsetHeight;
  });

  let imgAspect = null;
  img.addEventListener('load', function () {
    if (img.naturalWidth && img.naturalHeight) {
      imgAspect = img.naturalWidth / img.naturalHeight;
    }
  });
  if (img.naturalWidth && img.naturalHeight) {
    imgAspect = img.naturalWidth / img.naturalHeight;
  }

  document.addEventListener('mousemove', function (ev) {
    if (dragging) {
      wrapper.style.left = origLeft + ev.clientX - startX + 'px';
      wrapper.style.top = origTop + ev.clientY - startY + 'px';
    }
    if (resizing) {
      const newW = Math.max(40, origW + ev.clientX - startX);
      if (imgAspect) {
        wrapper.style.width = newW + 'px';
        wrapper.style.height = Math.round(newW / imgAspect) + 'px';
      } else {
        wrapper.style.width = newW + 'px';
        wrapper.style.height = Math.max(30, origH + ev.clientY - startY) + 'px';
      }
    }
  });
  document.addEventListener('mouseup', function () {
    if (dragging || resizing) {
      const rect = container.getBoundingClientRect();
      pic.xPct = parseFloat(((wrapper.offsetLeft / rect.width) * 100).toFixed(2));
      pic.yPct = parseFloat(((wrapper.offsetTop / rect.height) * 100).toFixed(2));
      pic.wPx = wrapper.offsetWidth;
      pic.hPx = wrapper.offsetHeight;
    }
    dragging = false;
    resizing = false;
  });

  container.appendChild(wrapper);
}
