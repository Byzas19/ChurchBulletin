import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import state from '../state/store.js';
import { switchTab } from '../ui/tabs.js';

export function exportPDF() {
  switchTab('preview');

  setTimeout(function () {
    const previewBox = document.getElementById('previewBox');
    if (!previewBox || !previewBox.querySelector('#bulletinContent')) {
      alert('No bulletin to export. Please enter data first.');
      return;
    }

    const handles = previewBox.querySelectorAll('.img-resize, .img-delete');
    for (let h = 0; h < handles.length; h++) handles[h].style.display = 'none';
    const bullImgs = previewBox.querySelectorAll('.bull-img');
    for (let bi = 0; bi < bullImgs.length; bi++) bullImgs[bi].style.borderColor = 'transparent';
    const colHandles = previewBox.querySelectorAll('.col-resize-handle');
    for (let ch = 0; ch < colHandles.length; ch++) colHandles[ch].style.display = 'none';
    const marginHandles = previewBox.querySelectorAll('.margin-handle');
    for (let mh = 0; mh < marginHandles.length; mh++) marginHandles[mh].style.display = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML =
      '<div style="background:#fff;padding:30px 50px;border-radius:10px;text-align:center;font-family:Georgia,serif"><div style="font-size:18px;font-weight:700;color:#1a3a5c;margin-bottom:8px">Generating PDF...</div><div style="font-size:13px;color:#8a7d6e">This may take a few seconds</div></div>';
    document.body.appendChild(overlay);

    const sundayDate = document.getElementById('sundayDate').value;

    const origPadding = previewBox.style.padding;
    previewBox.style.padding = '0';
    previewBox.scrollTop = 0;

    const captureW = previewBox.offsetWidth;
    const captureH = Math.round((captureW * 8.5) / 14);

    html2canvas(previewBox, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: captureW,
      height: captureH,
    })
      .then(function (canvas) {
        previewBox.style.padding = origPadding;
        try {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'in',
            format: 'legal',
          });
          pdf.addImage(imgData, 'PNG', 0, 0, 14, 8.5);
          pdf.save(
            'bulletin_' +
              (sundayDate || 'export') +
              (state.previewPage === 'back' ? '_backcover' : '') +
              '.pdf',
          );
        } catch (e) {
          alert('Error creating PDF: ' + e.message);
          console.error('PDF error:', e);
        }
        for (let h2 = 0; h2 < handles.length; h2++) handles[h2].style.display = '';
        for (let bi2 = 0; bi2 < bullImgs.length; bi2++) bullImgs[bi2].style.borderColor = '';
        for (let ch2 = 0; ch2 < colHandles.length; ch2++) colHandles[ch2].style.display = '';
        for (let mh2 = 0; mh2 < marginHandles.length; mh2++) marginHandles[mh2].style.display = '';
        document.body.removeChild(overlay);
      })
      .catch(function (err) {
        previewBox.style.padding = origPadding;
        for (let h3 = 0; h3 < handles.length; h3++) handles[h3].style.display = '';
        for (let bi3 = 0; bi3 < bullImgs.length; bi3++) bullImgs[bi3].style.borderColor = '';
        for (let ch3 = 0; ch3 < colHandles.length; ch3++) colHandles[ch3].style.display = '';
        for (let mh3 = 0; mh3 < marginHandles.length; mh3++) marginHandles[mh3].style.display = '';
        document.body.removeChild(overlay);
        alert('PDF generation failed: ' + err.message);
        console.error('html2canvas error:', err);
      });
  }, 300);
}
