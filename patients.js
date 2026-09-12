const NB_PATIENTS = [
  {
    id: 'arundhati',
    fullName: 'Arundhati',
    name: 'Arundhati',
    avatarInitial: 'A',
    location: 'Guwahati, Assam',
    lastActive: '9:42 AM',
    mood: 'Cheerful',
    activityLevel: 'Moderate',
    focusLevel: 'Good',
    alert: true,
    cognitiveDone: 3,
    cognitiveTotal: 4,
    exercisePercent: 75,
    remainingText: '1 cognitive exercise left today',
    totalPlayTime: '32 min',
    tags: ['Memory', 'Focus', 'Routine'],
    games: {
      memory: { meta: '5 of 6 remembered · 2 min ago' },
      best:   { meta: 'Best streak: 4 days' },
      logic:  { meta: '3 of 5 correct · Yesterday' }
    },
    schedule: [
      { icon: '💊', time: '8:00 AM', desc: 'Take Medicine' },
      { icon: '🍲', time: '9:00 AM', desc: 'Breakfast' },
      { icon: '🚶', time: '10:00 AM', desc: 'Walk in Garden' },
      { icon: '🍛', time: '1:00 PM', desc: 'Lunch' },
      { icon: '💊', time: '8:00 PM', desc: 'Take Medicine' }
    ]
  },
  {
    id: 'kamala-devi',
    fullName: 'Kamala Devi',
    name: 'Kamala Devi',
    avatarInitial: 'K',
    location: 'Jhansi, Uttar Pradesh',
    lastActive: '7:58 AM',
    mood: 'Calm',
    activityLevel: 'Low',
    focusLevel: 'Fair',
    alert: false,
    cognitiveDone: 2,
    cognitiveTotal: 4,
    exercisePercent: 40,
    remainingText: '2 cognitive exercises left today',
    totalPlayTime: '18 min',
    tags: ['Music', 'Sequence'],
    games: {
      memory: { meta: '4 of 6 remembered · 1 hr ago' },
      best:   { meta: 'Best streak: 2 days' },
      logic:  { meta: '2 of 5 correct · Today' }
    },
    schedule: [
      { icon: '💊', time: '8:00 AM', desc: 'Take Medicine' },
      { icon: '🍲', time: '9:00 AM', desc: 'Breakfast' },
      { icon: '🎵', time: '11:00 AM', desc: 'Music Memory Session' },
      { icon: '🍛', time: '1:00 PM', desc: 'Lunch' }
    ]
  },
  {
    id: 'rakesh-verma',
    fullName: 'Rakesh Verma',
    name: 'Rakesh Verma',
    avatarInitial: 'R',
    location: 'Delhi NCR',
    lastActive: '8:20 AM',
    mood: 'Content',
    activityLevel: 'Moderate',
    focusLevel: 'Good',
    alert: false,
    cognitiveDone: 4,
    cognitiveTotal: 4,
    exercisePercent: 100,
    remainingText: 'All exercises complete for today',
    totalPlayTime: '41 min',
    tags: ['Logic', 'Puzzle'],
    games: {
      memory: { meta: '6 of 6 remembered · 30 min ago' },
      best:   { meta: 'Best streak: 6 days' },
      logic:  { meta: '5 of 5 correct · Today' }
    },
    schedule: [
      { icon: '💊', time: '7:30 AM', desc: 'Take Medicine' },
      { icon: '🍲', time: '8:30 AM', desc: 'Breakfast' },
      { icon: '🧩', time: '10:30 AM', desc: 'Puzzle Session' },
      { icon: '🍛', time: '1:00 PM', desc: 'Lunch' },
      { icon: '🚶', time: '5:00 PM', desc: 'Evening Walk' }
    ]
  }
];

const NB_ACTIVE_KEY = 'nb_active_patient_id';
const NB_CARELOG_KEY_PREFIX = 'nb_care_log_';

function nbGetPatients(){
  return NB_PATIENTS;
}

function nbGetPatient(id){
  return NB_PATIENTS.find(p => p.id === id) || NB_PATIENTS[0];
}

function nbGetActivePatientId(){
  return localStorage.getItem(NB_ACTIVE_KEY) || NB_PATIENTS[0].id;
}

function nbSetActivePatientId(id){
  localStorage.setItem(NB_ACTIVE_KEY, id);
}

function nbGetCareLog(id){
  const raw = localStorage.getItem(NB_CARELOG_KEY_PREFIX + id);
  return raw ? JSON.parse(raw) : [
    '8:15 AM: (System) Daily routine loaded.'
  ];
}

function nbAddCareLogEntry(id, entryText){
  const entries = nbGetCareLog(id);
  entries.unshift(entryText);
  localStorage.setItem(NB_CARELOG_KEY_PREFIX + id, JSON.stringify(entries));
}

function nbRemoveCareLogEntry(id, index){
  const entries = nbGetCareLog(id);
  entries.splice(index, 1);
  localStorage.setItem(NB_CARELOG_KEY_PREFIX + id, JSON.stringify(entries));
}