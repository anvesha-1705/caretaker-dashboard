// ============================================================
// NeuroBloom dashboard — multi-patient rendering + interactions
// ============================================================

// Translation state — declared up top because nbRenderPatient() (called
// during initial page load, further down) reads nbActiveLang via
// nbApplyActiveTranslation(). A `let`/`const` declared later in the file
// can't be accessed before its own line runs, so this has to live here.
let nbActiveLang = 'en';
const nbTranslationCache = {}; // { langCode: { originalText: translatedText } }

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

  // Exercise progress (physical exercise removed — cognitive only)
  const exerciseHeading = document.getElementById('exerciseHeading');
  if (exerciseHeading) exerciseHeading.textContent = `${patient.name}'s Exercise Progress`;

  const cognitiveEl = document.getElementById('cognitiveExerciseText');
  if (cognitiveEl) cognitiveEl.innerHTML = `${patient.cognitiveDone} of ${patient.cognitiveTotal}<span>Cognitive Exercises</span>`;

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

  // Care Logs (doctor's note removed — Care Logs box stays)
  nbRenderCareLog(patient.id);

  // Re-apply translation to the freshly rendered text, if a non-English
  // language is currently selected.
  if (typeof nbApplyActiveTranslation === 'function') nbApplyActiveTranslation();
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

  careLogEntries.innerHTML = '';
  entries.forEach((entryText, index) => {
    const row = document.createElement('div');
    row.className = 'care-log-entry';

    const label = document.createElement('span');
    label.className = 'care-log-entry-text';
    label.textContent = entryText;
    row.appendChild(label);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'care-log-delete-btn';
    deleteBtn.title = 'Delete this note';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      nbRemoveCareLogEntry(id, index);
      nbRenderCareLog(id);
      if (typeof nbApplyActiveTranslation === 'function') nbApplyActiveTranslation();
    });
    row.appendChild(deleteBtn);

    careLogEntries.appendChild(row);
  });
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
    if (typeof nbApplyActiveTranslation === 'function') nbApplyActiveTranslation();
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

// ============================================================
// Manual location override from settings dropdown
// Persists the saved-location list and the active pick in
// localStorage so both survive a page refresh, instead of always
// resetting to the three hardcoded defaults.
// ============================================================
const NB_LOCATION_KEY = 'neurobloom_locations';
const NB_ACTIVE_LOCATION_KEY = 'neurobloom_active_location';
const NB_DEFAULT_LOCATIONS = ['Guwahati, Assam', 'Jhansi, Uttar Pradesh', 'Delhi NCR'];

const locationSelect = document.getElementById('locationSelect');
const locationValueEl = document.getElementById('locationChipValue');
const liveDotEl = document.getElementById('liveDot');
const locationManageList = document.getElementById('locationManageList');
const newLocationInput = document.getElementById('newLocationInput');
const addLocationBtn = document.getElementById('addLocationBtn');

function nbGetSavedLocations() {
  try {
    const saved = JSON.parse(localStorage.getItem(NB_LOCATION_KEY));
    return Array.isArray(saved) && saved.length ? saved : [...NB_DEFAULT_LOCATIONS];
  } catch {
    return [...NB_DEFAULT_LOCATIONS];
  }
}

function nbSaveLocations(list) {
  localStorage.setItem(NB_LOCATION_KEY, JSON.stringify(list));
}

function nbGetActiveLocation() {
  return localStorage.getItem(NB_ACTIVE_LOCATION_KEY) || nbGetSavedLocations()[0];
}

function nbSetActiveLocation(loc) {
  localStorage.setItem(NB_ACTIVE_LOCATION_KEY, loc);
  if (locationValueEl) locationValueEl.textContent = loc;
  if (liveDotEl) liveDotEl.style.display = 'none';
}

function nbRenderLocationDropdown() {
  if (!locationSelect) return;
  const locations = nbGetSavedLocations();
  const active = nbGetActiveLocation();

  locationSelect.innerHTML = '';
  locations.forEach((loc) => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    if (loc === active) opt.selected = true;
    locationSelect.appendChild(opt);
  });
}

function nbRenderLocationManageList() {
  if (!locationManageList) return;
  const locations = nbGetSavedLocations();
  const active = nbGetActiveLocation();

  locationManageList.innerHTML = '';
  locations.forEach((loc) => {
    const chip = document.createElement('span');
    chip.className = 'location-chip-item' + (loc === active ? ' active' : '');

    const label = document.createElement('span');
    label.textContent = loc;
    chip.appendChild(label);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'location-remove-btn';
    removeBtn.title = `Remove ${loc}`;
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => nbRemoveLocation(loc));
    chip.appendChild(removeBtn);

    locationManageList.appendChild(chip);
  });
}

function nbRefreshLocationUI() {
  nbRenderLocationDropdown();
  nbRenderLocationManageList();
}

function nbAddLocation(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;

  const locations = nbGetSavedLocations();
  if (!locations.includes(trimmed)) {
    locations.push(trimmed);
    nbSaveLocations(locations);
  }
  nbSetActiveLocation(trimmed);
  nbRefreshLocationUI();
}

function nbRemoveLocation(name) {
  let locations = nbGetSavedLocations();

  if (locations.length <= 1) {
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
      statusEl.textContent = 'You need at least one saved location.';
      statusEl.classList.add('error');
    }
    return;
  }

  locations = locations.filter((loc) => loc !== name);
  nbSaveLocations(locations);

  if (nbGetActiveLocation() === name) {
    nbSetActiveLocation(locations[0]);
  }
  nbRefreshLocationUI();
}

// Initial paint on page load
nbRefreshLocationUI();
if (locationValueEl) locationValueEl.textContent = nbGetActiveLocation();

if (locationSelect) {
  locationSelect.addEventListener('change', () => {
    nbSetActiveLocation(locationSelect.value);
    nbRenderLocationManageList();
  });
}

if (addLocationBtn && newLocationInput) {
  addLocationBtn.addEventListener('click', () => {
    nbAddLocation(newLocationInput.value);
    newLocationInput.value = '';
  });
  newLocationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      nbAddLocation(newLocationInput.value);
      newLocationInput.value = '';
    }
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

// ============================================================
// Translate feature
// Wires the four language chips at the bottom (Assamese / English /
// Manipuri / Mizo) to actually translate the patient-facing text on
// screen. Uses the free MyMemory Translation API (no key required).
// ============================================================

// ISO codes MyMemory expects. Assamese and Bengali (used here as the
// nearest supported code for Manipuri, which is often written in Bengali
// script) work well. Mizo has very limited machine-translation support —
// if the API can't handle it, we leave the original English text in place
// rather than show garbled output.
const NB_LANG_CODES = {
  'অসমীয়া': 'as',
  'English': 'en',
  'বাংলা': 'bn',
  'Mizo': 'lus'
};

// Containers whose text should NEVER be translated: the brand name, proper
// nouns (patient dropdown, location values), raw timestamps, and the
// language-picker buttons themselves (translating "English"/"Mizo" would be
// confusing for the very control used to pick a language).
const NB_TRANSLATE_EXCLUDE_SELECTORS = [
  '.brand',            // "NeuroBloom" / "COGNITIVE ASSISTANT"
  '.lang-btns',        // the language chips
  '#patientSelect',    // patient names
  '#locationSelect',   // location dropdown values
  '.settings-select',
  '#locationChipValue',
  '#locationManageList', // saved-location chip list
  '#newLocationInput',    // add-location input field
  '#statusLastActive', // timestamp
  '.s-time',           // schedule timestamps
  '.text-size-btns',   // "A-" / "A+"
  '#settingsTextSize'  // "A" size buttons
];

function nbShouldSkipTextNode(node){
  const text = node.nodeValue;
  if (!text || !text.trim()) return true;

  const parent = node.parentElement;
  if (!parent) return true;
  if (NB_TRANSLATE_EXCLUDE_SELECTORS.some(sel => parent.closest(sel))) return true;

  // Skip strings with no actual letters (pure emoji/symbols/numbers/times),
  // since there's nothing meaningful to translate.
  if (!/\p{L}/u.test(text)) return true;

  return false;
}

// Walks every text node inside the dashboard so newly rendered patient data
// (schedule items, tags, meta text, care log entries, etc.) gets picked up
// automatically — no need to hand-list every element.
function nbCollectTranslatableTextNodes(){
  const root = document.querySelector('.wrap');
  if (!root) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (!nbShouldSkipTextNode(n)) nodes.push(n);
  }
  return nodes;
}

async function nbTranslateText(text, langCode){
  if (!text || !text.trim()) return text;
  if (!nbTranslationCache[langCode]) nbTranslationCache[langCode] = {};
  if (nbTranslationCache[langCode][text]) return nbTranslationCache[langCode][text];

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || data.responseStatus !== 200) return text; // fall back silently
    nbTranslationCache[langCode][text] = translated;
    return translated;
  } catch (err) {
    return text; // offline or API hiccup — keep original text
  }
}

// The quick-note input's placeholder is an attribute, not a text node, so it
// needs its own pass.
async function nbTranslatePlaceholder(langCode){
  const input = document.getElementById('quickNoteInput');
  if (!input) return;
  if (!input.dataset.nbOriginal) input.dataset.nbOriginal = input.placeholder;

  if (langCode === 'en') {
    input.placeholder = input.dataset.nbOriginal;
    return;
  }
  input.placeholder = await nbTranslateText(input.dataset.nbOriginal, langCode);
}

async function nbTranslatePage(langCode){
  nbActiveLang = langCode;

  const nodes = nbCollectTranslatableTextNodes();

  // Cache each node's original English text once (as a plain JS property —
  // text nodes don't have `dataset`), so we always translate from English
  // rather than re-translating an already-translated string.
  nodes.forEach(node => {
    if (node.nbOriginal === undefined) node.nbOriginal = node.nodeValue;
  });

  if (langCode === 'en') {
    nodes.forEach(node => { node.nodeValue = node.nbOriginal; });
    await nbTranslatePlaceholder('en');
    return;
  }

  await Promise.all([
    ...nodes.map(async node => {
      const translated = await nbTranslateText(node.nbOriginal, langCode);
      node.nodeValue = translated;
    }),
    nbTranslatePlaceholder(langCode)
  ]);
}

// Re-applies the currently selected language after new content is rendered
// (e.g. switching patients, the schedule refreshing, or a new care log entry).
function nbApplyActiveTranslation(){
  if (nbActiveLang !== 'en') nbTranslatePage(nbActiveLang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const label = btn.querySelector('.top')?.textContent.trim();
    const langCode = NB_LANG_CODES[label] || 'en';
    nbTranslatePage(langCode);
  });
});