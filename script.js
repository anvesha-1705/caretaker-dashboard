// ============================================================
// NeuroBloom dashboard — multi-patient rendering + interactions
// ============================================================

function setToggle(isOn){
  document.getElementById('toggleOn').classList.toggle('on', isOn);
  document.getElementById('toggleOff').classList.toggle('on', !isOn);
}

let textScale = 1;
function resizeText(dir){
  textScale = Math.min(1.3, Math.max(0.85, textScale + dir * 0.08));
  document.body.style.fontSize = (16 * textScale) + 'px';
}

// ---------- Render a patient's data into the dashboard ----------
function nbRenderPatient(id){
  const patient = nbGetPatient(id);

  // Greeting + banner photo
  const greetingTitle = document.getElementById('greetingTitle');
  if (greetingTitle) greetingTitle.textContent = `Good Morning, ${patient.name} and Care Team!`;

  nbSetAvatar('bannerPhoto', 'bannerPhotoFallback', patient);

  // Location chip
  const locationValue = document.getElementById('locationChipValue');
  if (locationValue) locationValue.textContent = patient.location;
  const liveDot = document.getElementById('liveDot');
  if (liveDot) liveDot.style.display = 'none';

  // Status card
  const statusHeading = document.getElementById('statusHeading');
  if (statusHeading) statusHeading.textContent = `${patient.name}'s Current Status`;

  nbSetAvatar('statusPhoto', 'statusPhotoFallback', patient);

  setText('statusLastActive', patient.lastActive);
  setText('statusMood', patient.mood);
  setText('statusActivity', patient.activityLevel);
  setText('statusFocus', patient.focusLevel);

  const alertPill = document.getElementById('statusAlertPill');
  const notifToggle = document.getElementById('notifToggle');
  if (alertPill) {
    const notifsOn = !notifToggle || notifToggle.checked;
    alertPill.style.display = (patient.alert && notifsOn) ? 'inline-block' : 'none';
  }

  // Exercise progress
  const exerciseHeading = document.getElementById('exerciseHeading');
  if (exerciseHeading) exerciseHeading.textContent = `${patient.name}'s Exercise Progress`;

  const cognitiveEl = document.getElementById('cognitiveExerciseText');
  if (cognitiveEl) cognitiveEl.innerHTML = `${patient.cognitiveDone} of ${patient.cognitiveTotal}<span>Cognitive Exercises</span>`;

  const physicalEl = document.getElementById('physicalExerciseText');
  if (physicalEl) physicalEl.innerHTML = `${patient.physicalDone} of ${patient.physicalTotal}<span>Physical Exercise</span>`;

  const barFill = document.getElementById('exerciseBarFill');
  if (barFill) barFill.style.width = patient.exercisePercent + '%';

  setText('remainingText', patient.remainingText);

  // Daily Activity Overview
  setText('totalPlayTime', `Total Play Time: ${patient.totalPlayTime}`);

  const tagRow = document.getElementById('tagRow');
  if (tagRow) {
    tagRow.innerHTML = '';
    patient.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagRow.appendChild(span);
    });
  }

  setText('memoryMeta', patient.games.memory.meta);
  setText('bestMeta', patient.games.best.meta);
  setText('logicMeta', patient.games.logic.meta);

  // Carry the active patient through to the performance-analysis pages
  document.querySelectorAll('.game-row[data-game]').forEach(row => {
    const type = row.getAttribute('data-game');
    row.href = `analysis-${type}.html?patient=${patient.id}`;
  });

  // Today's Schedule
  const scheduleList = document.getElementById('scheduleList');
  if (scheduleList) {
    scheduleList.innerHTML = '';
    if (patient.schedule.length === 0) {
      scheduleList.innerHTML = '<div class="schedule-item"><span class="s-desc">No items scheduled.</span></div>';
    } else {
      patient.schedule.forEach(item => {
        const row = document.createElement('div');
        row.className = 'schedule-item';
        row.innerHTML = `<div class="s-icon">${item.icon}</div><span class="s-time">${item.time}</span><span class="s-desc">${item.desc}</span>`;
        scheduleList.appendChild(row);
      });
    }
  }

  // Notes
  setText('noteAvatarInitial', patient.note.initial);
  const noteWho = document.getElementById('noteWho');
  if (noteWho) noteWho.innerHTML = `${patient.note.name} <span>${patient.note.org} · ${patient.note.time}</span>`;
  setText('noteText', patient.note.text);

  // Care Logs
  nbRenderCareLog(patient.id);
}

function setText(id, text){
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Shows the patient's photo if assets/<id>.jpg exists, otherwise a clean
// initials placeholder. Toggles between img/fallback rather than
// permanently replacing the node, so it keeps working across patient switches.
function nbSetAvatar(imgId, fallbackId, patient){
  const img = document.getElementById(imgId);
  const fallback = document.getElementById(fallbackId);
  if (!img || !fallback) return;

  fallback.textContent = patient.avatarInitial || patient.name.charAt(0);

  img.onerror = () => {
    img.style.display = 'none';
    fallback.style.display = 'flex';
  };
  img.onload = () => {
    img.style.display = '';
    fallback.style.display = 'none';
  };

  fallback.style.display = 'none';
  img.style.display = '';
  img.alt = patient.name;
  img.src = `assets/${patient.id}.jpg`;
}

function nbRenderCareLog(id){
  const careLogEntries = document.getElementById('careLogEntries');
  if (!careLogEntries) return;
  const entries = nbGetCareLog(id);
  careLogEntries.innerHTML = entries.map(e => `<div class="care-log-entry">${e}</div>`).join('');
}

// ---------- Patient switcher ----------
const patientSelect = document.getElementById('patientSelect');

if (patientSelect) {
  nbGetPatients().forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.fullName;
    patientSelect.appendChild(opt);
  });

  const activeId = (new URLSearchParams(window.location.search).get('patient')) || nbGetActivePatientId();
  patientSelect.value = activeId;
  nbSetActivePatientId(activeId);
  nbRenderPatient(activeId);

  patientSelect.addEventListener('change', () => {
    nbSetActivePatientId(patientSelect.value);
    nbRenderPatient(patientSelect.value);
  });
}

// Quick caretaker note: press Enter to add it to the active patient's Care Logs
const quickNoteInput = document.getElementById('quickNoteInput');

if (quickNoteInput) {
  quickNoteInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const text = quickNoteInput.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const activeId = nbGetActivePatientId();
    nbAddCareLogEntry(activeId, `${time}: (Caregiver log) ${text}`);
    nbRenderCareLog(activeId);
    quickNoteInput.value = '';
  });
}

// ---------- Settings panel ----------
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');

function hideSettings(){ settingsPanel.classList.remove('open'); }

if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('open');
  });

  closeSettings?.addEventListener('click', hideSettings);

  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
      hideSettings();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSettings();
  });
}

// Notifications toggle -> show/hide the Alert pill for the active patient
const notifToggle = document.getElementById('notifToggle');
if (notifToggle) {
  notifToggle.addEventListener('change', () => {
    nbRenderPatient(nbGetActivePatientId());
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

// Manual location override from settings dropdown
const locationSelect = document.getElementById('locationSelect');
const locationValueEl = document.getElementById('locationChipValue');
const liveDotEl = document.getElementById('liveDot');

if (locationSelect && locationValueEl) {
  locationSelect.addEventListener('change', () => {
    locationValueEl.textContent = locationSelect.value;
    if (liveDotEl) liveDotEl.style.display = 'none';
  });
}

// Use My Live Location -> browser Geolocation API + reverse geocoding
const useLiveLocationBtn = document.getElementById('useLiveLocationBtn');
const locationStatus = document.getElementById('locationStatus');

if (useLiveLocationBtn && locationValueEl) {
  useLiveLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Geolocation is not supported on this device.';
      locationStatus.classList.add('error');
      return;
    }

    locationStatus.classList.remove('error');
    locationStatus.textContent = 'Getting current location…';
    useLiveLocationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || 'Unknown area';
          const state = addr.state || addr.state_district || '';
          const label = state ? `${city}, ${state}` : city;

          locationValueEl.textContent = label;
          if (liveDotEl) liveDotEl.style.display = 'inline-flex';
          locationStatus.textContent = 'Updated just now.';
        } catch (err) {
          locationStatus.textContent = 'Could not resolve address, but coordinates were captured.';
          locationValueEl.textContent = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          if (liveDotEl) liveDotEl.style.display = 'inline-flex';
        } finally {
          useLiveLocationBtn.disabled = false;
        }
      },
      (err) => {
        locationStatus.classList.add('error');
        locationStatus.textContent =
          err.code === 1
            ? 'Location permission denied.'
            : 'Could not get your location. Try again.';
        useLiveLocationBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}