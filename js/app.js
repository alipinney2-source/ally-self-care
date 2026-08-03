import {
  load,
  save,
  localDate,
  exportBackup,
  importBackup,
  reset
} from "./store.js";

let state = load();

const WORKOUTS = {
  A: [
    {name:"Squat",resistance:"20 lb",sets:3,reps:"10",target:"Legs and glutes",setup:"Stand securely on the bands with feet around hip-width apart. Hold the bar at shoulder height.",movement:"Sit your hips back and down, keep your chest lifted, then press through the whole foot to stand.",avoid:"Knees collapsing inward, heels lifting or rushing."},
    {name:"Bent-over row",resistance:"20–30 lb",sets:3,reps:"10",target:"Upper back and arms",setup:"Stand on the bands and hinge forward from the hips with a long spine.",movement:"Pull the bar towards your lower ribs, pause, then lower slowly.",avoid:"Rounding your back, shrugging or jerking."},
    {name:"Chest press",resistance:"20 lb",sets:3,reps:"12",target:"Chest, shoulders and triceps",setup:"Secure the door anchor behind you at chest height and face away.",movement:"Press your hands forwards until your arms are almost straight, then return slowly.",avoid:"Arching your lower back or locking your elbows."},
    {name:"Romanian deadlift",resistance:"30 lb",sets:3,reps:"10",target:"Glutes and hamstrings",setup:"Stand on the bands with the bar in front of your thighs and knees softly bent.",movement:"Push your hips backwards while keeping the bar close to your legs. Stand by squeezing your glutes.",avoid:"Turning it into a squat or rounding your back."},
    {name:"Shoulder press",resistance:"20 lb",sets:3,reps:"10",target:"Shoulders and triceps",setup:"Stand on the bands and hold the bar at shoulder height.",movement:"Brace your middle and press overhead. Lower smoothly.",avoid:"Leaning backwards or shrugging."},
    {name:"Pallof press",resistance:"20 lb",sets:3,reps:"10 each side",target:"Core stability",setup:"Anchor the band at chest height and stand side-on.",movement:"Press straight out while resisting rotation, then return slowly.",avoid:"Twisting towards the anchor or holding your breath."}
  ],
  B: [
    {name:"Supported reverse lunge",resistance:"Bodyweight first",sets:3,reps:"8 each side",target:"Legs, glutes and balance",setup:"Stand beside a stable chair or wall.",movement:"Step one foot backwards and lower only as far as comfortable. Push through the front foot to return.",avoid:"A narrow step or the front knee collapsing inward."},
    {name:"Standing row",resistance:"20–30 lb",sets:3,reps:"12",target:"Upper back",setup:"Anchor at chest height and face it with your arms extended.",movement:"Draw your elbows back and squeeze your shoulder blades. Return with control.",avoid:"Shrugging, leaning backwards or flaring your ribs."},
    {name:"Biceps curl",resistance:"20 lb",sets:3,reps:"12",target:"Front of upper arms",setup:"Stand on the bands with arms by your sides and palms forwards.",movement:"Keep elbows tucked and curl your hands towards your shoulders.",avoid:"Swinging or moving your elbows forwards."},
    {name:"Triceps pressdown",resistance:"20 lb",sets:3,reps:"12",target:"Back of upper arms",setup:"Anchor overhead and keep your elbows tucked.",movement:"Straighten your arms towards the floor, then return slowly.",avoid:"Moving your upper arms or hunching your shoulders."},
    {name:"Glute kickback",resistance:"20 lb",sets:3,reps:"12 each side",target:"Glutes",setup:"Attach the ankle strap and hold something stable.",movement:"Move one leg backwards without rotating your hips. Return slowly.",avoid:"Arching your back or swinging your leg."},
    {name:"Standing wood chop",resistance:"20 lb",sets:3,reps:"10 each side",target:"Core and hips",setup:"Anchor at shoulder height and stand side-on with both hands on the handle.",movement:"Move diagonally across your body while your hips and upper body turn together.",avoid:"Pulling only with your arms or rushing."}
  ],
  C: [
    {name:"Deadlift",resistance:"30 lb",sets:3,reps:"10",target:"Glutes, hamstrings and back",setup:"Stand securely on the bands with the bar in front of your thighs.",movement:"Hinge from your hips, then drive through your feet to stand tall.",avoid:"Rounding your spine or pulling with your arms."},
    {name:"Chest fly",resistance:"20 lb",sets:3,reps:"12",target:"Chest and shoulders",setup:"Anchor behind you at chest height with arms open and elbows softly bent.",movement:"Bring your hands together in a wide arc, then reopen with control.",avoid:"Locking your elbows or overstretching behind you."},
    {name:"Lateral raise",resistance:"20 lb",sets:3,reps:"12",target:"Side shoulders",setup:"Stand on the bands with arms resting by your sides.",movement:"Raise your arms to around shoulder height and lower slowly.",avoid:"Shrugging or lifting above shoulder height."},
    {name:"Face pull",resistance:"20 lb",sets:3,reps:"12",target:"Upper back and rear shoulders",setup:"Anchor at face height and hold the handles with arms extended.",movement:"Pull towards eyebrow level with elbows wide.",avoid:"Leaning backwards or dropping your elbows."},
    {name:"Suitcase hold and march",resistance:"20–30 lb",sets:3,reps:"30–45 sec each side",target:"Core and posture",setup:"Hold resistance on one side and stand tall.",movement:"March slowly without leaning. Switch sides.",avoid:"Rushing, slumping or holding your breath."},
    {name:"Plank",resistance:"No band",sets:3,reps:"20–30 sec",target:"Core and shoulders",setup:"Use a wall, worktop, knees or toes.",movement:"Hold a straight line while breathing normally.",avoid:"Dropping or lifting your hips too far."}
  ]
};


const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function dateFromIso(value) {
  return new Date(`${value}T12:00:00`);
}

function isoFromDate(date) {
  return localDate(date);
}

function selectedDate() {
  return state.selectedDate || localDate();
}

function setSelectedDate(value) {
  state.selectedDate = value || localDate();
  save(state);
  renderAll();
}

function moveDate(days) {
  const date = dateFromIso(selectedDate());
  date.setDate(date.getDate() + days);
  setSelectedDate(isoFromDate(date));
}

function mondayFor(value) {
  const date = dateFromIso(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

function weekDates(value) {
  const monday = mondayFor(value);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return isoFromDate(date);
  });
}

function formatNumber(value, fallback = "0") {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-GB") : fallback;
}

function formatSleep(entry) {
  const hours = Number(entry?.sleepHours || 0);
  const minutes = Number(entry?.sleepMinutes || 0);
  if (!hours && !minutes) return "Not logged";
  return `${hours} h ${minutes} min`;
}

function dailyEntry(value = selectedDate()) {
  return state.daily[value] || {};
}

function nutritionEntry(value = selectedDate()) {
  return state.nutrition[value] || {};
}

function hasDailyData(value) {
  const daily = dailyEntry(value);
  const nutrition = nutritionEntry(value);
  return Object.values(daily).some((item) => item !== "" && item !== false && item !== null && item !== undefined)
    || Object.values(nutrition).some((item) => item !== "" && item !== false && item !== null && item !== undefined);
}

function progressPercent(value, target) {
  const numericValue = Number(value) || 0;
  const numericTarget = Number(target) || 0;
  return numericTarget ? Math.min(100, Math.round((numericValue / numericTarget) * 100)) : 0;
}

function metricCard(label, value) {
  return `<div class="metric"><small>${label}</small><strong>${value}</strong></div>`;
}

function nutritionCard(icon, label, value, target, unit, kind = "minimum") {
  const numericValue = Number(value) || 0;
  const numericTarget = Number(target) || 0;
  const percentage = progressPercent(numericValue, numericTarget);

  let statusClass = "status-neutral";
  let statusText = "Not logged";

  if (value !== "" && value !== undefined && value !== null) {
    if (kind === "calories") {
      const difference = Math.abs(numericValue - numericTarget);
      statusClass = difference <= 100 ? "status-good" : difference <= 200 ? "status-close" : "status-neutral";
    } else {
      statusClass = numericValue >= numericTarget
        ? "status-good"
        : numericValue >= numericTarget * 0.85
          ? "status-close"
          : "status-neutral";
    }
    statusText = `${formatNumber(numericValue)} / ${formatNumber(numericTarget)} ${unit}`;
  }

  return `
    <div class="nutrition-card">
      <div class="nutrition-head">
        <span>${icon} ${label}</span>
        <strong class="${statusClass}">${statusText}</strong>
      </div>
      <div class="progress-track"><span style="width:${percentage}%"></span></div>
    </div>`;
}

function saveState() {
  save(state);
  renderAll();
}

function currentHourGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Ally";
  if (hour < 18) return "Good afternoon, Ally";
  return "Good evening, Ally";
}

function calculateDailyProgress(date) {
  const daily = dailyEntry(date);
  const nutrition = nutritionEntry(date);
  const checks = [
    Boolean(daily.weight),
    Boolean(daily.steps),
    Boolean(daily.sleepHours || daily.sleepMinutes),
    Boolean(daily.energy),
    Boolean(nutrition.calories),
    Boolean(nutrition.protein),
    Boolean(nutrition.fibre),
    Boolean(nutrition.waterMl)
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}


function renderFitness() {
  $("#activityDate").value = selectedDate();
  renderWorkoutHistory();
  renderActivityHistory();
  renderExerciseLibrary();
}

function openFitnessPanel(panelId, clickedButton) {
  $$(".fitness-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#${panelId}`).classList.add("active");
  $$(".fitness-menu-button").forEach((button) => button.classList.remove("active"));
  clickedButton.classList.add("active");
  renderFitness();
}

function renderWorkout(type) {
  const exercises = WORKOUTS[type];
  $("#workoutSession").innerHTML = `
    <article class="card">
      <p class="eyebrow">WORKOUT ${type}</p>
      <h2>Full-body strength session</h2>
      <p class="muted">Warm up for around five minutes and rest for 60–90 seconds between sets.</p>
      <div id="activeExercises"></div>
      <button id="completeWorkoutButton" class="primary full-width">Complete Workout ${type}</button>
    </article>`;

  $("#activeExercises").innerHTML = exercises.map((exercise, index) => `
    <div class="exercise-card" data-exercise="${exercise.name}">
      <div class="exercise-title">
        <div><h3>${index + 1}. ${exercise.name}</h3><span class="pill">${exercise.resistance}</span></div>
        <strong>${exercise.sets} × ${exercise.reps}</strong>
      </div>
      <div class="guide-grid">
        <div class="guide-box"><strong>Setup</strong>${exercise.setup}</div>
        <div class="guide-box"><strong>Movement</strong>${exercise.movement}</div>
      </div>
      <p class="muted"><strong>Works:</strong> ${exercise.target}</p>
      <p class="muted"><strong>Avoid:</strong> ${exercise.avoid}</p>
      <div class="set-buttons">
        ${Array.from({length: exercise.sets}, (_, setIndex) => `<button class="set-button">Set ${setIndex + 1}</button>`).join("")}
      </div>
      <div class="effort-buttons">
        <button>Too easy</button><button>Just right</button><button>Too hard</button>
      </div>
    </div>`).join("");

  $$(".set-button").forEach((button) => {
    button.addEventListener("click", () => button.classList.toggle("done"));
  });

  $$(".effort-buttons button").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    });
  });

  $("#completeWorkoutButton").addEventListener("click", () => {
    const exerciseResults = [...$("#activeExercises").querySelectorAll(".exercise-card")].map((card) => ({
      name: card.dataset.exercise,
      setsCompleted: card.querySelectorAll(".set-button.done").length,
      effort: card.querySelector(".effort-buttons .selected")?.textContent || ""
    }));

    state.workouts.push({
      id: Date.now(),
      date: selectedDate(),
      type,
      exercises: exerciseResults
    });

    save(state);
    alert(`Workout ${type} saved. Nicely done.`);
    renderAll();
    renderWorkout(type);
  });

  $("#workoutSession").scrollIntoView({behavior:"smooth", block:"start"});
}

function renderWorkoutHistory() {
  const rows = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  $("#workoutHistory").innerHTML = rows.length
    ? rows.map((row) => `
      <div class="list-card">
        <div class="list-row"><strong>Workout ${row.type || ""}</strong><span>${row.date}</span></div>
        <p class="history-meta">${row.exercises?.reduce((sum, item) => sum + (item.setsCompleted || 0), 0) || 0} sets completed</p>
      </div>`).join("")
    : `<p class="muted">No strength workouts logged yet.</p>`;
}

function saveActivity() {
  const activity = {
    id: Date.now(),
    date: $("#activityDate").value || selectedDate(),
    type: $("#activityType").value,
    minutes: $("#activityMinutes").value,
    distance: $("#activityDistance").value,
    notes: $("#activityNotes").value
  };

  state.activities.push(activity);
  save(state);
  $("#activityMessage").innerHTML = `<div class="success">Activity saved.</div>`;
  $("#activityMinutes").value = "";
  $("#activityDistance").value = "";
  $("#activityNotes").value = "";
  renderAll();
}

function deleteActivity(id) {
  if (!confirm("Delete this activity?")) return;
  state.activities = state.activities.filter((item) => Number(item.id) !== Number(id));
  save(state);
  renderAll();
}

function renderActivityHistory() {
  const rows = [...state.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
  $("#activityHistory").innerHTML = rows.length
    ? rows.map((row) => `
      <div class="list-card">
        <div class="list-row"><strong>${row.type}</strong><span>${row.date}</span></div>
        <p class="history-meta">${row.minutes ? `${row.minutes} minutes` : "Duration not entered"}${row.distance ? ` · ${row.distance} miles` : ""}</p>
        ${row.notes ? `<p class="history-meta">${row.notes}</p>` : ""}
        <button class="danger full-width delete-activity" data-id="${row.id}">Delete</button>
      </div>`).join("")
    : `<p class="muted">No activities logged yet.</p>`;

  $$(".delete-activity").forEach((button) => {
    button.addEventListener("click", () => deleteActivity(button.dataset.id));
  });
}

function renderExerciseLibrary() {
  const allExercises = [...WORKOUTS.A, ...WORKOUTS.B, ...WORKOUTS.C];
  const uniqueExercises = [...new Map(allExercises.map((exercise) => [exercise.name, exercise])).values()];

  $("#exerciseLibrary").innerHTML = uniqueExercises.map((exercise) => `
    <details class="exercise-card exercise-details">
      <summary>${exercise.name} · ${exercise.resistance}</summary>
      <p><strong>Works:</strong> ${exercise.target}</p>
      <div class="guide-grid">
        <div class="guide-box"><strong>Setup</strong>${exercise.setup}</div>
        <div class="guide-box"><strong>Movement</strong>${exercise.movement}</div>
      </div>
      <p class="muted"><strong>Common mistakes:</strong> ${exercise.avoid}</p>
    </details>`).join("");
}


function renderHome() {
  const date = selectedDate();
  const daily = dailyEntry(date);
  const nutrition = nutritionEntry(date);
  const goals = state.goals;
  const dateObject = dateFromIso(date);

  $("#selectedDate").value = date;
  $("#nutritionDate").value = date;

  $("#dayReminder").innerHTML = hasDailyData(date)
    ? ""
    : `<div class="warning"><strong>${date === localDate() ? "Today has not been completed yet." : "No check-in for this date."}</strong><br>Add it when you are ready.</div>`;

  $("#greeting").textContent = date === localDate()
    ? currentHourGreeting()
    : `Reviewing ${dateObject.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`;

  $("#briefingText").textContent = `${dateObject.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })}. ${daily.steps ? `${formatNumber(daily.steps)} steps logged.` : "Steps not logged yet."}`;

  const progress = calculateDailyProgress(date);
  $("#dailyProgressRing").style.setProperty("--progress", `${progress * 3.6}deg`);
  $("#dailyProgressValue").textContent = `${progress}%`;

  const week = weekDates(date);
  const weeklySteps = week.reduce((total, currentDate) => total + (Number(dailyEntry(currentDate).steps) || 0), 0);
  const latestWeight = [...state.measurements]
    .filter((entry) => entry.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.weight;

  $("#homeMetrics").innerHTML = [
    metricCard("Selected-day steps", formatNumber(daily.steps)),
    metricCard("Latest weight", latestWeight ? `${latestWeight} lb` : "Not entered"),
    metricCard("Sleep", formatSleep(daily)),
    metricCard("Energy", daily.energy ? `${daily.energy}/10` : "Not logged")
  ].join("");

  const stepPercentage = progressPercent(weeklySteps, goals.weeklySteps);
  $("#weeklyStepsLabel").textContent = `${formatNumber(weeklySteps)} / ${formatNumber(goals.weeklySteps)}`;
  $("#weeklyStepsBar").style.width = `${stepPercentage}%`;
  $("#weeklyStepsHelp").textContent = weeklySteps >= goals.weeklySteps
    ? "Weekly goal achieved. Brilliant work."
    : `${formatNumber(goals.weeklySteps - weeklySteps)} steps remaining this week.`;

  $("#weightInput").value = daily.weight || "";
  $("#stepsInput").value = daily.steps || "";
  $("#sleepHoursInput").value = daily.sleepHours ?? "";
  $("#sleepMinutesInput").value = daily.sleepMinutes ?? "";
  $("#energyInput").value = daily.energy || "";
  $("#moodInput").value = daily.mood || "";
  $("#dailyNoteInput").value = daily.note || "";

  $("#homeNutrition").innerHTML = [
    nutritionCard("🔥", "Calories", nutrition.calories, goals.calories, "kcal", "calories"),
    nutritionCard("💪", "Protein", nutrition.protein, goals.protein, "g"),
    nutritionCard("🌾", "Fibre", nutrition.fibre, goals.fibre, "g"),
    nutritionCard("💧", "Water", nutrition.waterMl, goals.waterMl, "ml")
  ].join("");

  renderWeeklyWins();
}

function renderNutrition() {
  const nutrition = nutritionEntry();
  const goals = state.goals;

  $("#caloriesInput").value = nutrition.calories || "";
  $("#proteinInput").value = nutrition.protein || "";
  $("#fibreInput").value = nutrition.fibre || "";
  $("#waterInput").value = nutrition.waterMl || "";
  $("#carbsInput").value = nutrition.carbs || "";
  $("#fatInput").value = nutrition.fat || "";
  $("#foodNoteInput").value = nutrition.note || "";

  $("#nutritionProgress").innerHTML = [
    nutritionCard("🔥", "Calories", nutrition.calories, goals.calories, "kcal", "calories"),
    nutritionCard("💪", "Protein", nutrition.protein, goals.protein, "g"),
    nutritionCard("🌾", "Fibre", nutrition.fibre, goals.fibre, "g"),
    nutritionCard("💧", "Water", nutrition.waterMl, goals.waterMl, "ml")
  ].join("");

  const dates = weekDates(selectedDate());
  let caloriesOnTarget = 0;
  let proteinOnTarget = 0;
  let fibreOnTarget = 0;
  let waterOnTarget = 0;

  dates.forEach((date) => {
    const entry = nutritionEntry(date);
    if (entry.calories && Math.abs(Number(entry.calories) - goals.calories) <= 100) caloriesOnTarget += 1;
    if (Number(entry.protein) >= goals.protein) proteinOnTarget += 1;
    if (Number(entry.fibre) >= goals.fibre) fibreOnTarget += 1;
    if (Number(entry.waterMl) >= goals.waterMl) waterOnTarget += 1;
  });

  $("#weeklyNutrition").innerHTML = [
    ["Calories on target", `${caloriesOnTarget}/7 days`],
    ["Protein target", `${proteinOnTarget}/7 days`],
    ["Fibre target", `${fibreOnTarget}/7 days`],
    ["Water target", `${waterOnTarget}/7 days`]
  ].map(([label, value]) => `<div class="list-card"><div class="list-row"><span>${label}</span><strong>${value}</strong></div></div>`).join("");
}

function renderWeeklyWins() {
  const dates = weekDates(selectedDate());
  const goals = state.goals;
  const weeklySteps = dates.reduce((total, date) => total + (Number(dailyEntry(date).steps) || 0), 0);
  const loggedDays = dates.filter(hasDailyData).length;
  const nutritionDays = dates.map(nutritionEntry);
  const proteinHits = nutritionDays.filter((entry) => Number(entry.protein) >= goals.protein).length;
  const fibreHits = nutritionDays.filter((entry) => Number(entry.fibre) >= goals.fibre).length;
  const waterHits = nutritionDays.filter((entry) => Number(entry.waterMl) >= goals.waterMl).length;

  const wins = [];
  if (weeklySteps >= goals.weeklySteps) wins.push("👣 You reached your 70,000-step goal.");
  if (loggedDays >= 5) wins.push(`📱 You checked in on ${loggedDays} days.`);
  if (proteinHits >= 5) wins.push(`💪 Protein was on target for ${proteinHits} days.`);
  if (fibreHits >= 5) wins.push(`🌾 Fibre was on target for ${fibreHits} days.`);
  if (waterHits >= 5) wins.push(`💧 Hydration was on target for ${waterHits} days.`);

  $("#weeklyWins").innerHTML = wins.length
    ? wins.map((win) => `<div class="list-card"><strong>${win}</strong></div>`).join("")
    : `<p class="muted">Your wins will appear as the week builds.</p>`;
}

function renderInsights() {
  const dates = weekDates(selectedDate());
  const goals = state.goals;
  const stepRows = dates.map((date) => ({
    date,
    steps: Number(dailyEntry(date).steps) || 0
  }));
  const weeklySteps = stepRows.reduce((total, row) => total + row.steps, 0);
  const loggedDays = dates.filter(hasDailyData).length;
  const nutritionDays = dates.filter((date) => nutritionEntry(date).calories).length;

  $("#insightSummary").innerHTML = [
    ["Weekly steps", `${formatNumber(weeklySteps)} / ${formatNumber(goals.weeklySteps)}`],
    ["Days logged", `${loggedDays}/7`],
    ["Nutrition days", `${nutritionDays}/7`],
    ["Selected date", dateFromIso(selectedDate()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })]
  ].map(([label, value]) => `<div class="list-card"><div class="list-row"><span>${label}</span><strong>${value}</strong></div></div>`).join("");

  $("#stepHistory").innerHTML = stepRows.map(({ date, steps }) => `
    <div class="list-card">
      <div class="list-row">
        <strong>${dateFromIso(date).toLocaleDateString("en-GB", { weekday: "short" })}</strong>
        <span>${formatNumber(steps)} steps</span>
      </div>
      <div class="progress-track" style="margin-top:8px"><span style="width:${progressPercent(steps, 10000)}%"></span></div>
    </div>`).join("");

  const weights = [...state.measurements]
    .filter((entry) => entry.weight)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  $("#weightHistory").innerHTML = weights.length
    ? weights.map((entry) => `<div class="list-card"><div class="list-row"><span>${entry.date}</span><strong>${entry.weight} lb</strong></div></div>`).join("")
    : `<p class="muted">No weight history yet.</p>`;

  const nutritionHistory = Object.entries(state.nutrition)
    .filter(([, entry]) => entry && (entry.calories || entry.protein || entry.fibre || entry.waterMl))
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 10);

  $("#nutritionHistory").innerHTML = nutritionHistory.length
    ? nutritionHistory.map(([date, entry]) => `
      <div class="list-card">
        <strong>${date}</strong>
        <p class="muted">${entry.calories || "–"} kcal · ${entry.protein || "–"} g protein · ${entry.fibre || "–"} g fibre · ${entry.waterMl || "–"} ml water</p>
      </div>`).join("")
    : `<p class="muted">No nutrition history yet.</p>`;
}

function renderSettings() {
  $("#weeklyStepsGoalInput").value = state.goals.weeklySteps;
  $("#calorieGoalInput").value = state.goals.calories;
  $("#proteinGoalInput").value = state.goals.protein;
  $("#fibreGoalInput").value = state.goals.fibre;
  $("#waterGoalInput").value = state.goals.waterMl;

  document.documentElement.dataset.theme = state.theme || "light";
  $("#themeToggle").textContent = state.theme === "dark" ? "☀" : "☾";
}

function renderAll() {
  state = load();
  renderHome();
  renderNutrition();
  renderFitness();
  renderInsights();
  renderSettings();
}

function saveCheckIn() {
  const date = selectedDate();
  const sleepHours = Math.max(0, Math.min(24, Number($("#sleepHoursInput").value) || 0));
  const sleepMinutes = Math.max(0, Math.min(59, Number($("#sleepMinutesInput").value) || 0));

  state.daily[date] = {
    ...(state.daily[date] || {}),
    weight: $("#weightInput").value,
    steps: $("#stepsInput").value,
    sleepHours,
    sleepMinutes,
    energy: $("#energyInput").value,
    mood: $("#moodInput").value,
    note: $("#dailyNoteInput").value
  };

  const weight = $("#weightInput").value;
  if (weight) {
    const existingIndex = state.measurements.findIndex((entry) => entry.date === date);
    const record = { date, weight, id: Date.now() };
    if (existingIndex >= 0) state.measurements[existingIndex] = { ...state.measurements[existingIndex], ...record };
    else state.measurements.push(record);
  }

  save(state);
  $("#checkInMessage").innerHTML = `<div class="success">Check-in saved for ${date}.</div>`;
  renderAll();
}

function saveNutrition() {
  const date = selectedDate();
  state.nutrition[date] = {
    calories: $("#caloriesInput").value,
    protein: $("#proteinInput").value,
    fibre: $("#fibreInput").value,
    waterMl: $("#waterInput").value,
    carbs: $("#carbsInput").value,
    fat: $("#fatInput").value,
    note: $("#foodNoteInput").value
  };
  save(state);
  $("#nutritionMessage").innerHTML = `<div class="success">Nutrition saved for ${date}.</div>`;
  renderAll();
}

function saveGoals() {
  state.goals = {
    ...state.goals,
    weeklySteps: Number($("#weeklyStepsGoalInput").value) || 70000,
    calories: Number($("#calorieGoalInput").value) || 1856,
    protein: Number($("#proteinGoalInput").value) || 95,
    fibre: Number($("#fibreGoalInput").value) || 34,
    waterMl: Number($("#waterGoalInput").value) || 2500
  };
  save(state);
  $("#goalsMessage").innerHTML = `<div class="success">Goals saved.</div>`;
  renderAll();
}

$$(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".view").forEach((view) => view.classList.remove("active"));
    $(`#${button.dataset.view}`).classList.add("active");
    $$(".nav-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderAll();
  });
});

$$(".go-to-nutrition").forEach((button) => {
  button.addEventListener("click", () => {
    $('[data-view="nutritionView"]').click();
  });
});

$("#selectedDate").addEventListener("change", (event) => setSelectedDate(event.target.value));
$("#nutritionDate").addEventListener("change", (event) => setSelectedDate(event.target.value));
$("#previousDay").addEventListener("click", () => moveDate(-1));
$("#nextDay").addEventListener("click", () => moveDate(1));
$("#nutritionPreviousDay").addEventListener("click", () => moveDate(-1));
$("#nutritionNextDay").addEventListener("click", () => moveDate(1));

$("#saveCheckInButton").addEventListener("click", saveCheckIn);
$("#saveNutritionButton").addEventListener("click", saveNutrition);
$("#saveGoalsButton").addEventListener("click", saveGoals);

$("#themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  save(state);
  renderSettings();
});

$("#exportButton").addEventListener("click", () => exportBackup(state));
$("#importButton").addEventListener("click", () => $("#importFileInput").click());
$("#importFileInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importBackup(file, (success) => {
    alert(success ? "Backup imported successfully." : "That backup could not be imported.");
    renderAll();
  });
});

$("#resetButton").addEventListener("click", () => {
  if (!confirm("Delete all Ally's Self Care data stored in this browser?")) return;
  reset();
  state = load();
  renderAll();
});


$$(".fitness-menu-button").forEach((button) => {
  button.addEventListener("click", () => openFitnessPanel(button.dataset.fitnessPanel, button));
});

$$(".workout-choice").forEach((button) => {
  button.addEventListener("click", () => renderWorkout(button.dataset.workout));
});

$("#saveActivityButton").addEventListener("click", saveActivity);

renderAll();