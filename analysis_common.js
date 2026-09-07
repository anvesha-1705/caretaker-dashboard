// Shared by analysis-memory.html / analysis-best.html / analysis-logic.html
// Reads the active patient (from the URL, falling back to localStorage)
// and personalizes the page title + meta line + back link.

function nbInitAnalysisPage(opts) {
  const params = new URLSearchParams(window.location.search);
  const patientId = params.get('patient') || nbGetActivePatientId();
  const patient = nbGetPatient(patientId);

  nbSetActivePatientId(patientId);

  const nameEl = document.getElementById('pageTitleName');
  const metaEl = document.getElementById('pageTitleMeta');
  const backLink = document.getElementById('backLink');

  if (nameEl) {
    nameEl.textContent = `${opts.fallbackName} — ${patient.name}`;
  }
  if (metaEl) {
    const meta = (patient.games && patient.games[opts.gameKey] && patient.games[opts.gameKey].meta)
      || opts.fallbackMeta;
    metaEl.textContent = meta;
  }
  if (backLink) {
    backLink.href = `index.html?patient=${patient.id}`;
  }
}