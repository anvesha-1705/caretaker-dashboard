function setToggle(isOn){
    document.getElementById('toggleOn').classList.toggle('on', isOn);
    document.getElementById('toggleOff').classList.toggle('on', !isOn);
  }

  let textScale = 1;
  function resizeText(dir){
    textScale = Math.min(1.3, Math.max(0.85, textScale + dir * 0.08));
    document.body.style.fontSize = (16 * textScale) + 'px';
  }

  // Quick caretaker note: press Enter to add it to the Care Logs list
  const quickNoteInput = document.getElementById('quickNoteInput');
  const careLogEntries = document.getElementById('careLogEntries');

  if (quickNoteInput && careLogEntries) {
    quickNoteInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const text = quickNoteInput.value.trim();
      if (!text) return;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const entry = document.createElement('div');
      entry.className = 'care-log-entry';
      entry.innerHTML = `${time}: (Caregiver log) ${text}`;

      careLogEntries.prepend(entry);
      quickNoteInput.value = '';
    });
  }

  // ---------- Settings panel ----------
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettings = document.getElementById('closeSettings');

  function openSettings(){ settingsPanel.classList.add('open'); }
  function hideSettings(){ settingsPanel.classList.remove('open'); }

  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('open');
    });

    closeSettings?.addEventListener('click', hideSettings);

    // close when clicking outside the panel
    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        hideSettings();
      }
    });

    // close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideSettings();
    });
  }

  // Notifications toggle -> show/hide the Alert pill on the status card
  const notifToggle = document.getElementById('notifToggle');
  const alertPill = document.querySelector('.alert-pill');
  if (notifToggle && alertPill) {
    notifToggle.addEventListener('change', () => {
      alertPill.style.display = notifToggle.checked ? 'inline-block' : 'none';
    });
  }

  // Default text size buttons (Small / Medium / Large)
  const textSizeBtns = document.querySelectorAll('#settingsTextSize button');
  const sizeMap = { small: 14, medium: 16, large: 19 };
  textSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      textSizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.getAttribute('data-size');
      document.body.style.fontSize = sizeMap[size] + 'px';
    });
  });

  // Active location select -> updates the location chip on the dashboard
  const locationSelect = document.getElementById('locationSelect');
  const locationValue = document.querySelector('.location-chip .value');
  if (locationSelect && locationValue) {
    locationSelect.addEventListener('change', () => {
      locationValue.textContent = locationSelect.value;
    });
  }