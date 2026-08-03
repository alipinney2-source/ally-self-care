const CURRENT_KEY = "allySelfCare2Alpha1";
const LEGACY_KEYS = [
  "allySelfCareRelease07",
  "allySelfCarePolishedV2",
  "allySelfCareWholeHogV1",
  "allySelfCareV2",
  "allyStrongV1"
];

export function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaults() {
  return {
    version: "2.0.0-alpha.1",
    selectedDate: localDate(),
    theme: "light",
    goals: {
      weeklySteps: 70000,
      calories: 1856,
      protein: 95,
      fibre: 34,
      waterMl: 2500
    },
    daily: {},
    nutrition: {},
    measurements: [],
    activities: [],
    workouts: [],
    journal: [],
    selfcare: [],
    checks: []
  };
}

function normaliseWater(value) {
  if (value === "" || value === undefined || value === null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return numeric <= 10 ? Math.round(numeric * 1000) : Math.round(numeric);
}

function normaliseSleep(record) {
  if (!record) return record;
  if (record.sleepHours !== undefined || record.sleepMinutes !== undefined) return record;
  if (record.sleep !== undefined && record.sleep !== "") {
    const decimal = Number(record.sleep);
    if (Number.isFinite(decimal)) {
      record.sleepHours = Math.floor(decimal);
      record.sleepMinutes = Math.round((decimal - Math.floor(decimal)) * 60);
    }
  }
  return record;
}

function merge(base, oldData) {
  if (!oldData || typeof oldData !== "object") return base;

  base.goals = { ...base.goals, ...(oldData.goals || {}) };
  if (base.goals.water && !oldData.goals?.waterMl) {
    base.goals.waterMl = normaliseWater(base.goals.water);
  }

  base.daily = { ...base.daily, ...(oldData.daily || {}) };
  Object.values(base.daily).forEach(normaliseSleep);

  base.nutrition = { ...base.nutrition, ...(oldData.nutrition || {}) };
  Object.values(base.nutrition).forEach((entry) => {
    if (entry && entry.water !== undefined && entry.waterMl === undefined) {
      entry.waterMl = normaliseWater(entry.water);
    }
  });

  ["measurements", "activities", "journal", "selfcare", "checks"].forEach((key) => {
    if (Array.isArray(oldData[key])) base[key] = [...base[key], ...oldData[key]];
  });

  if (Array.isArray(oldData.workouts)) base.workouts = [...base.workouts, ...oldData.workouts];
  if (Array.isArray(oldData.sessions)) base.workouts = [...base.workouts, ...oldData.sessions];

  return base;
}

export function save(data) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(data));
}

export function load() {
  const current = localStorage.getItem(CURRENT_KEY);
  if (current) {
    try {
      return merge(defaults(), JSON.parse(current));
    } catch {
      return defaults();
    }
  }

  let data = defaults();
  let migrated = false;

  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        data = merge(data, JSON.parse(raw));
        migrated = true;
      }
    } catch {
      // Ignore malformed legacy data.
    }
  }

  save(data);
  if (migrated) localStorage.setItem("allySelfCareAlpha1Migrated", "yes");
  return data;
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ally-self-care-backup-${localDate()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function importBackup(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = merge(defaults(), JSON.parse(reader.result));
      save(imported);
      callback(true);
    } catch {
      callback(false);
    }
  };
  reader.readAsText(file);
}

export function reset() {
  localStorage.removeItem(CURRENT_KEY);
}