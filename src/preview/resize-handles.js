import state from '../state/store.js';

export function setupColumnResizers() {
  const table = document.querySelector('#bulletinContent .sched-table');
  if (!table) return;

  const oldWrapper = table.closest('.col-resize-wrapper');
  if (oldWrapper) {
    const oldHandles = oldWrapper.querySelectorAll('.col-resize-handle');
    for (let oh = 0; oh < oldHandles.length; oh++) oldHandles[oh].remove();
  }

  let wrapper = table.parentElement;
  if (!wrapper.classList.contains('col-resize-wrapper')) {
    const div = document.createElement('div');
    div.className = 'col-resize-wrapper';
    div.style.position = 'relative';
    table.parentNode.insertBefore(div, table);
    div.appendChild(table);
    wrapper = div;
  }

  const rows = table.querySelectorAll('tr');
  let refRow = null;
  for (let ri = 0; ri < rows.length; ri++) {
    const tds = rows[ri].querySelectorAll('td');
    if (tds.length === 4) {
      refRow = rows[ri];
      break;
    }
  }
  if (!refRow) return;

  const cells = refRow.querySelectorAll('td');
  const tableRect = table.getBoundingClientRect();
  const tableH = table.offsetHeight;

  if (tableRect.width === 0) return;

  const handleDefs = [
    { afterCol: 0, prop: 'date' },
    { afterCol: 1, prop: 'time' },
    { afterCol: 2, prop: 'donor' },
  ];

  for (let hi = 0; hi < handleDefs.length; hi++) {
    (function (def) {
      const handle = document.createElement('div');
      handle.className = 'col-resize-handle';
      handle.style.height = tableH + 'px';

      let cellRect;
      if (def.prop === 'donor') {
        cellRect = cells[3].getBoundingClientRect();
        handle.style.left = cellRect.left - tableRect.left - 3 + 'px';
      } else {
        cellRect = cells[def.afterCol].getBoundingClientRect();
        handle.style.left = cellRect.right - tableRect.left - 3 + 'px';
      }

      let startX, startWidth;
      handle.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        startX = ev.clientX;
        startWidth = state.colWidths[def.prop];
        handle.classList.add('active');

        function onMove(e) {
          const delta = e.clientX - startX;
          if (def.prop === 'donor') {
            state.colWidths[def.prop] = Math.max(40, startWidth - delta);
          } else {
            state.colWidths[def.prop] = Math.max(30, startWidth + delta);
          }
          const cols = table.querySelectorAll('colgroup col');
          cols[0].style.width = state.colWidths.date + 'px';
          cols[1].style.width = state.colWidths.time + 'px';
          cols[3].style.width = state.colWidths.donor + 'px';

          const allHandles = wrapper.querySelectorAll('.col-resize-handle');
          const tRows = table.querySelectorAll('tr');
          let rr = null;
          for (let k = 0; k < tRows.length; k++) {
            if (tRows[k].querySelectorAll('td').length === 4) {
              rr = tRows[k];
              break;
            }
          }
          if (rr && allHandles.length >= 3) {
            const tds = rr.querySelectorAll('td');
            const tRect = table.getBoundingClientRect();
            allHandles[0].style.left = tds[0].getBoundingClientRect().right - tRect.left - 3 + 'px';
            allHandles[1].style.left = tds[1].getBoundingClientRect().right - tRect.left - 3 + 'px';
            allHandles[2].style.left = tds[3].getBoundingClientRect().left - tRect.left - 3 + 'px';
          }
        }
        function onUp() {
          handle.classList.remove('active');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      wrapper.appendChild(handle);
    })(handleDefs[hi]);
  }
}

export function positionMarginHandle(handle, def, bulletin) {
  const bRect = bulletin.getBoundingClientRect();
  const elRect = def.cssEl.getBoundingClientRect();
  if (def.side === 'left' && def.prop.indexOf('Outer') >= 0) {
    handle.style.left = elRect.left - bRect.left + state.sectionMargins[def.prop] - 3 + 'px';
  } else if (def.side === 'right' && def.prop.indexOf('Inner') >= 0) {
    handle.style.left = elRect.right - bRect.left - state.sectionMargins[def.prop] - 4 + 'px';
  } else if (def.side === 'left' && def.prop.indexOf('Inner') >= 0) {
    handle.style.left = elRect.left - bRect.left + state.sectionMargins[def.prop] - 3 + 'px';
  } else {
    handle.style.left = elRect.right - bRect.left - state.sectionMargins[def.prop] - 4 + 'px';
  }
}

export function setupMarginHandles() {
  const bulletin = document.getElementById('bulletinContent');
  if (!bulletin) return;

  const oldHandles = bulletin.querySelectorAll('.margin-handle');
  for (let i = 0; i < oldHandles.length; i++) oldHandles[i].remove();

  const colLeft = bulletin.querySelector('.col-left');
  const colRight = bulletin.querySelector('.col-right');
  if (!colLeft || !colRight) return;

  const bulletinRect = bulletin.getBoundingClientRect();
  if (bulletinRect.width === 0) return;

  const defs = [
    {
      prop: 'leftOuter', cssEl: colLeft, side: 'left',
      getPos: function () { return colLeft.getBoundingClientRect().left - bulletinRect.left; },
      dir: 1,
    },
    {
      prop: 'leftInner', cssEl: colLeft, side: 'right',
      getPos: function () {
        return colLeft.getBoundingClientRect().right - bulletinRect.left - colLeft.clientWidth + colLeft.offsetWidth - 7;
      },
      dir: -1,
    },
    {
      prop: 'rightInner', cssEl: colRight, side: 'left',
      getPos: function () { return colRight.getBoundingClientRect().left - bulletinRect.left; },
      dir: 1,
    },
    {
      prop: 'rightOuter', cssEl: colRight, side: 'right',
      getPos: function () { return colRight.getBoundingClientRect().right - bulletinRect.left - 7; },
      dir: -1,
    },
  ];

  for (let d = 0; d < defs.length; d++) {
    (function (def) {
      const handle = document.createElement('div');
      handle.className = 'margin-handle ' + def.side + '-side';
      handle.style.height = '100%';

      positionMarginHandle(handle, def, bulletin);

      let startX, startVal;
      handle.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        startX = ev.clientX;
        startVal = state.sectionMargins[def.prop];
        handle.classList.add('active');

        function onMove(e) {
          const dx = e.clientX - startX;
          state.sectionMargins[def.prop] = Math.max(0, Math.min(80, startVal + dx * def.dir));

          colLeft.style.padding =
            '0 ' + state.sectionMargins.leftInner + 'px 0 ' + state.sectionMargins.leftOuter + 'px';
          colRight.style.padding =
            '0 ' + state.sectionMargins.rightOuter + 'px 0 ' + state.sectionMargins.rightInner + 'px';

          const allMH = bulletin.querySelectorAll('.margin-handle');
          for (let mi = 0; mi < allMH.length; mi++) {
            positionMarginHandle(allMH[mi], defs[mi], bulletin);
          }
        }
        function onUp() {
          handle.classList.remove('active');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          setupColumnResizers();
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      bulletin.appendChild(handle);
    })(defs[d]);
  }
}
