import state from '../state/store.js';

export function renderBackCover() {
  document.getElementById('bcChurchName').value = state.backCover.churchName;
  document.getElementById('bcAddress1').value = state.backCover.address1;
  document.getElementById('bcAddress2').value = state.backCover.address2;
  document.getElementById('bcPriestName').value = state.backCover.priestName;
  document.getElementById('bcPhone').value = state.backCover.phone;
  document.getElementById('bcFax').value = state.backCover.fax;
  document.getElementById('bcEmail').value = state.backCover.email;
  document.getElementById('bcWebsite').value = state.backCover.website;
}

export function wireBackCoverEvents() {
  document.getElementById('bcChurchName').addEventListener('input', function () {
    state.backCover.churchName = this.value;
  });
  document.getElementById('bcAddress1').addEventListener('input', function () {
    state.backCover.address1 = this.value;
  });
  document.getElementById('bcAddress2').addEventListener('input', function () {
    state.backCover.address2 = this.value;
  });
  document.getElementById('bcPriestName').addEventListener('input', function () {
    state.backCover.priestName = this.value;
  });
  document.getElementById('bcPhone').addEventListener('input', function () {
    state.backCover.phone = this.value;
  });
  document.getElementById('bcFax').addEventListener('input', function () {
    state.backCover.fax = this.value;
  });
  document.getElementById('bcEmail').addEventListener('input', function () {
    state.backCover.email = this.value;
  });
  document.getElementById('bcWebsite').addEventListener('input', function () {
    state.backCover.website = this.value;
  });
}
