// ============================================================
// NeuroBloom — Patient data
// Add a new person by copying one of these objects and giving
// it a unique "id". Everything else is optional but recommended.
// ============================================================

const NB_PATIENTS = [
  {
    id: 'arundhati',
    name: 'Arundhati',
    fullName: 'Arundhati Sharma',
    avatarInitial: 'A',
    location: 'Guwahati, Assam',
    lastActive: '5 min ago',
    mood: 'Calmer',
    activityLevel: 'Normal',
    focusLevel: 'Improved',
    alert: true,
    totalPlayTime: '45 min',
    tags: ['focus', 'language', 'creative'],
    games: {
      memory: { meta: 'Cognitive · played this morning' },
      best:   { meta: 'Across all games this week' },
      logic:  { meta: 'Problem-solving · yesterday' }
    },
    cognitiveDone: 3, cognitiveTotal: 4,
    physicalDone: 1, physicalTotal: 1,
    exercisePercent: 75,
    remainingText: 'Remaining: Language exercise, Short walk',
    schedule: [
      { icon: '🕐', time: '11:30 AM', desc: 'Medicine time – Post-Lunch' },
      { icon: '💧', time: '2:00 PM',  desc: 'Hydration check' },
      { icon: '📹', time: '4:00 PM',  desc: 'Weekly video call with Priya' },
      { icon: '🔔', time: '5:30 PM',  desc: 'Evening walk' },
      { icon: '🚶', time: '5:30 PM',  desc: 'Evening walk' }
    ],
    note: {
      initial: 'D', name: 'Dr. Sharma', org: 'AIIMS Guwahati', time: '10:00 AM',
      text: 'Wonderful focus on the Memory Match game today, Arundhati. Keep up this regular morning play!'
    },
    careLog: [
      '11:35 AM: (Caregiver log) Medicine administered.<br>Ate most of breakfast.'
    ]
  },
  {
    id: 'ramesh',
    name: 'Ramesh',
    fullName: 'Ramesh Verma',
    avatarInitial: 'R',
    location: 'Jhansi, Uttar Pradesh',
    lastActive: '20 min ago',
    mood: 'Cheerful',
    activityLevel: 'Low',
    focusLevel: 'Steady',
    alert: false,
    totalPlayTime: '30 min',
    tags: ['memory', 'logic'],
    games: {
      memory: { meta: 'Cognitive · played yesterday' },
      best:   { meta: 'Across all games this week' },
      logic:  { meta: 'Problem-solving · this morning' }
    },
    cognitiveDone: 2, cognitiveTotal: 4,
    physicalDone: 0, physicalTotal: 1,
    exercisePercent: 40,
    remainingText: 'Remaining: Creative exercise, Focus game, Short walk',
    schedule: [
      { icon: '🕐', time: '9:00 AM',  desc: 'Medicine time – Post-Breakfast' },
      { icon: '💧', time: '1:00 PM',  desc: 'Hydration check' },
      { icon: '🔔', time: '6:00 PM',  desc: 'Evening walk' }
    ],
    note: {
      initial: 'S', name: 'Dr. Singh', org: 'City Hospital Jhansi', time: '9:30 AM',
      text: 'Ramesh is responding well to the new routine. Continue with light morning walks.'
    },
    careLog: [
      '9:05 AM: (Caregiver log) Medicine administered.<br>Skipped breakfast, had tea only.'
    ]
  },
  {
    id: 'kamla',
    name: 'Kamla',
    fullName: 'Kamla Devi',
    avatarInitial: 'K',
    location: 'Delhi NCR',
    lastActive: '1 hour ago',
    mood: 'Quiet',
    activityLevel: 'Normal',
    focusLevel: 'Needs attention',
    alert: true,
    totalPlayTime: '15 min',
    tags: ['language'],
    games: {
      memory: { meta: 'Cognitive · not played today' },
      best:   { meta: 'Across all games this week' },
      logic:  { meta: 'Problem-solving · 2 days ago' }
    },
    cognitiveDone: 1, cognitiveTotal: 4,
    physicalDone: 0, physicalTotal: 1,
    exercisePercent: 20,
    remainingText: 'Remaining: Memory, Focus, Logic exercises, Short walk',
    schedule: [
      { icon: '🕐', time: '10:00 AM', desc: 'Medicine time – Post-Breakfast' },
      { icon: '📹', time: '3:00 PM',  desc: 'Weekly video call with son' }
    ],
    note: {
      initial: 'M', name: 'Dr. Mehta', org: 'Apollo Delhi', time: '11:00 AM',
      text: 'Kamla seems low on energy today — consider encouraging a short game session.'
    },
    careLog: [
      '10:10 AM: (Caregiver log) Medicine administered.<br>Mood appears low today.'
    ]
  }
];

const NB_ACTIVE_KEY = 'nb_active_patient_id';
const NB_CARELOG_KEY_PREFIX = 'nb_carelog_';

function nbGetPatients() {
  return NB_PATIENTS;
}

function nbGetPatient(id) {
  return NB_PATIENTS.find(p => p.id === id) || NB_PATIENTS[0];
}

function nbGetActivePatientId() {
  const stored = localStorage.getItem(NB_ACTIVE_KEY);
  if (stored && NB_PATIENTS.some(p => p.id === stored)) return stored;
  return NB_PATIENTS[0].id;
}

function nbSetActivePatientId(id) {
  localStorage.setItem(NB_ACTIVE_KEY, id);
}

// Care-log entries the caretaker adds via the quick-note box are stored
// per patient in localStorage, on top of that patient's starter entries.
function nbGetCareLog(id) {
  const patient = nbGetPatient(id);
  const extra = JSON.parse(localStorage.getItem(NB_CARELOG_KEY_PREFIX + id) || '[]');
  return [...extra, ...patient.careLog];
}

function nbAddCareLogEntry(id, htmlText) {
  const extra = JSON.parse(localStorage.getItem(NB_CARELOG_KEY_PREFIX + id) || '[]');
  extra.unshift(htmlText);
  localStorage.setItem(NB_CARELOG_KEY_PREFIX + id, JSON.stringify(extra));
}