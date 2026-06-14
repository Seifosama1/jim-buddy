/* ══════════════════════════════════════════
   JIM BUDDY — App Logic
══════════════════════════════════════════ */

// ─── Data Layer ───────────────────────────────────────────

const DB = {
  get: (key, def = null) => {
    try { const v = localStorage.getItem('jimbuddy_' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set: (key, val) => { try { localStorage.setItem('jimbuddy_' + key, JSON.stringify(val)); } catch {} },
};

function getData() {
  return {
    customWorkouts: DB.get('customWorkouts', []),
    sessions: DB.get('sessions', []),
    weeklyGoals: DB.get('weeklyGoals', []),
    waterLog: DB.get('waterLog', []),
    weightLog: DB.get('weightLog', []),
    weightLossGoal: DB.get('weightLossGoal', null),
    cardioLog: DB.get('cardioLog', []),
    cardioGoal: DB.get('cardioGoal', null),
    settings: DB.get('settings', { waterGoal: 2000 }),
    prs: DB.get('prs', {}),
  };
}

// ─── State ────────────────────────────────────────────────

let state = {
  currentPage: 'home',
  muscleFilter: 'All',
  editingWorkoutId: null,
  activeSession: null,
  restTimer: null,
  chart: null,
};

// ─── Navigation ───────────────────────────────────────────

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add('active');
  state.currentPage = page;
  if (page === 'home') renderDashboard();
  if (page === 'workouts') renderWorkouts();
  if (page === 'progress') renderProgress();
  if (page === 'goals') renderGoals();
  if (page === 'water') renderWater();
}

// ─── Modal Helpers ────────────────────────────────────────

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ─── Toast ────────────────────────────────────────────────

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ─── Greeting ────────────────────────────────────────────

function updateGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
  document.getElementById('greeting-title').textContent = g;
}

// ─── Dashboard ────────────────────────────────────────────

function renderDashboard() {
  updateGreeting();
  const { sessions, prs, settings, waterLog, weightLog, weightLossGoal } = getData();

  // Streak
  const streak = calcStreak(sessions);
  document.getElementById('stat-sessions').textContent = sessions.length;
  document.getElementById('stat-prs').textContent = Object.keys(prs).length;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('streak-count').textContent = streak;

  // Water
  const todayWater = getTodayWater(waterLog);
  const goal = settings.waterGoal || 2000;
  document.getElementById('dash-water-text').textContent = `${todayWater} / ${goal} ml`;
  document.getElementById('dash-water-bar').style.width = Math.min(100, (todayWater / goal) * 100) + '%';

  // Weight Loss
  if (weightLossGoal && weightLog.length > 0) {
    const latest = weightLog[weightLog.length - 1].weight;
    const start = weightLossGoal.currentWeight;
    const target = weightLossGoal.targetWeight;
    const lost = start - latest;
    const toGo = latest - target;
    const pct = Math.min(100, Math.max(0, ((start - latest) / (start - target)) * 100));
    document.getElementById('dash-wl-text').textContent = `${latest}kg → ${target}kg (${toGo > 0 ? toGo.toFixed(1) + 'kg to go' : '🎉 Goal reached!'})`;
    document.getElementById('dash-wl-bar').style.width = pct + '%';
  } else if (weightLossGoal) {
    document.getElementById('dash-wl-text').textContent = `Goal: ${weightLossGoal.targetWeight}kg`;
  } else {
    document.getElementById('dash-wl-text').textContent = 'Not set';
  }

  // Recent sessions
  const recentEl = document.getElementById('recent-sessions-list');
  if (sessions.length === 0) {
    recentEl.innerHTML = `<div class="empty-state"><span class="empty-icon">🏋️</span><p>No sessions yet. Start your first workout!</p><button class="btn btn-primary" onclick="navigate('workouts')">Browse Workouts</button></div>`;
  } else {
    recentEl.innerHTML = sessions.slice(-3).reverse().map(s => sessionCardHTML(s)).join('');
  }

  // Quick muscle grid
  const grid = document.getElementById('quick-muscle-grid');
  grid.innerHTML = MUSCLE_GROUPS.filter(m => m !== 'All').map(m => `
    <div class="muscle-chip" onclick="navigate('workouts'); setMuscleFilter('${m}')">
      <span class="muscle-chip-icon">${MUSCLE_EMOJIS[m] || '💪'}</span>
      <span>${m}</span>
    </div>`).join('');
}

function sessionCardHTML(s) {
  return `
    <div class="session-card">
      <div class="session-card-header">
        <span class="session-card-name">${escHtml(s.name)}</span>
        <span class="session-card-date">${formatDate(s.date)}</span>
      </div>
      <div class="session-card-detail">${s.exercises ? s.exercises.length : 0} exercise(s) · ${s.totalSets || 0} sets</div>
      <div class="session-card-sets">
        ${(s.exercises || []).slice(0, 4).map(e => `<span class="session-set-tag">${escHtml(e.name)}</span>`).join('')}
        ${(s.exercises || []).length > 4 ? `<span class="session-set-tag">+${s.exercises.length - 4} more</span>` : ''}
      </div>
    </div>`;
}

function calcStreak(sessions) {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map(s => s.date?.split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  let streak = 0, check = today;
  for (const d of dates) {
    if (d === check) { streak++; check = prevDay(check); }
    else if (d < check) break;
  }
  return streak;
}

function prevDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ─── Workouts ─────────────────────────────────────────────

function renderWorkouts() {
  renderMuscleChips();
  filterExercises();
  renderCustomWorkouts();
}

function renderMuscleChips() {
  const el = document.getElementById('muscle-chips');
  el.innerHTML = MUSCLE_GROUPS.map(m =>
    `<button class="chip ${state.muscleFilter === m ? 'active' : ''}" onclick="setMuscleFilter('${m}')">${m}</button>`
  ).join('');
}

function setMuscleFilter(m) {
  state.muscleFilter = m;
  renderMuscleChips();
  filterExercises();
}

function filterExercises() {
  const q = document.getElementById('exercise-search').value.toLowerCase();
  const { prs } = getData();
  let exercises = EXERCISE_LIBRARY;
  if (state.muscleFilter !== 'All') exercises = exercises.filter(e => e.muscle === state.muscleFilter);
  if (q) exercises = exercises.filter(e => e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q));

  const groups = {};
  exercises.forEach(e => { if (!groups[e.muscle]) groups[e.muscle] = []; groups[e.muscle].push(e); });

  const el = document.getElementById('exercise-list');
  if (exercises.length === 0) { el.innerHTML = '<p class="muted-text">No exercises found.</p>'; return; }

  el.innerHTML = Object.entries(groups).map(([muscle, exs]) => `
    <div class="exercise-group">
      <div class="exercise-group-title">${MUSCLE_EMOJIS[muscle] || ''} ${muscle}</div>
      ${exs.map(e => `
        <div class="exercise-card" onclick="startSessionForExercise('${e.id}')">
          <div class="exercise-info">
            <div class="exercise-name">${escHtml(e.name)}</div>
            <div class="exercise-meta">${e.isCardio ? 'Cardio' : `${e.sets} sets × ${e.reps} reps · ${e.rest}s rest`}</div>
            ${prs[e.id] ? `<div class="exercise-pr">PR: ${prs[e.id].weight}kg</div>` : ''}
          </div>
          <span style="color:var(--text3);font-size:20px">▶</span>
        </div>`).join('')}
    </div>`).join('');
}

function renderCustomWorkouts() {
  const { customWorkouts } = getData();
  const el = document.getElementById('custom-workouts-list');
  if (!customWorkouts.length) { el.innerHTML = '<p class="muted-text">No custom workouts yet.</p>'; return; }
  el.innerHTML = customWorkouts.map(w => `
    <div class="exercise-card">
      <div class="exercise-info" onclick="startSessionForCustom('${w.id}')">
        <div class="exercise-name">${escHtml(w.name)}</div>
        <div class="exercise-meta">${w.muscle} · ${w.sets} sets × ${w.reps} reps · ${w.rest}s rest</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-ghost" onclick="editWorkout('${w.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteWorkout('${w.id}')">🗑</button>
      </div>
    </div>`).join('');
}

// Create / Edit Workout
document.getElementById('create-workout-btn').onclick = () => {
  state.editingWorkoutId = null;
  document.getElementById('workout-modal-title').textContent = 'Create Workout';
  ['wm-name','wm-sets','wm-reps','wm-rest','wm-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('wm-muscle').value = 'Chest';
  openModal('workout-modal');
};

function editWorkout(id) {
  const { customWorkouts } = getData();
  const w = customWorkouts.find(x => x.id === id);
  if (!w) return;
  state.editingWorkoutId = id;
  document.getElementById('workout-modal-title').textContent = 'Edit Workout';
  document.getElementById('wm-name').value = w.name;
  document.getElementById('wm-muscle').value = w.muscle;
  document.getElementById('wm-sets').value = w.sets;
  document.getElementById('wm-reps').value = w.reps;
  document.getElementById('wm-rest').value = w.rest;
  document.getElementById('wm-notes').value = w.notes || '';
  openModal('workout-modal');
}

function saveWorkout() {
  const name = document.getElementById('wm-name').value.trim();
  if (!name) { toast('Please enter a workout name'); return; }
  const w = {
    id: state.editingWorkoutId || 'cw_' + Date.now(),
    name,
    muscle: document.getElementById('wm-muscle').value,
    sets: parseInt(document.getElementById('wm-sets').value) || 3,
    reps: parseInt(document.getElementById('wm-reps').value) || 10,
    rest: parseInt(document.getElementById('wm-rest').value) || 60,
    notes: document.getElementById('wm-notes').value.trim(),
  };
  let cw = getData().customWorkouts;
  if (state.editingWorkoutId) { cw = cw.map(x => x.id === state.editingWorkoutId ? w : x); }
  else { cw.push(w); }
  DB.set('customWorkouts', cw);
  closeModal('workout-modal');
  toast(state.editingWorkoutId ? 'Workout updated!' : 'Workout saved!');
  renderCustomWorkouts();
}

function deleteWorkout(id) {
  if (!confirm('Delete this workout?')) return;
  let cw = getData().customWorkouts.filter(x => x.id !== id);
  DB.set('customWorkouts', cw);
  toast('Workout deleted');
  renderCustomWorkouts();
}

// ─── Session Logging ──────────────────────────────────────

function startSessionForExercise(id) {
  const ex = EXERCISE_LIBRARY.find(e => e.id === id);
  if (!ex) return;
  openSessionModal(ex);
}

function startSessionForCustom(id) {
  const { customWorkouts } = getData();
  const w = customWorkouts.find(x => x.id === id);
  if (!w) return;
  openSessionModal({ ...w, id: w.id });
}

function openSessionModal(exercise) {
  state.activeSession = { exercise, sets: [] };
  document.getElementById('session-modal-title').textContent = exercise.name;
  const body = document.getElementById('session-modal-body');
  const sets = exercise.sets || 3;
  const isCardio = exercise.isCardio;

  body.innerHTML = `
    <div class="session-exercise-title">${escHtml(exercise.name)}</div>
    ${isCardio ? renderCardioSessionInputs(exercise) : renderStrengthSessionInputs(exercise, sets)}
    <div class="rest-timer" id="rest-timer-box">
      <div class="timer-display" id="timer-display">0:00</div>
      <div class="timer-label">REST · tap to skip</div>
      <button class="btn btn-sm btn-ghost" style="margin-top:8px" onclick="skipTimer()">Skip</button>
    </div>
  `;

  openModal('session-modal');
}

function renderStrengthSessionInputs(exercise, sets) {
  return `
    <div class="set-labels">
      <span>Set</span><span>Weight (kg)</span><span>Reps</span><span>✓</span>
    </div>
    ${Array.from({length: sets}, (_, i) => `
      <div class="set-row" id="set-row-${i}">
        <div class="set-num" id="set-num-${i}">${i+1}</div>
        <input class="set-input" type="number" id="set-weight-${i}" placeholder="${exercise.id === 'push-up' || exercise.id === 'pull-up' ? 'BW' : '0'}" step="0.5" />
        <input class="set-input" type="number" id="set-reps-${i}" placeholder="${exercise.reps}" />
        <div class="set-check" id="set-check-${i}" onclick="toggleSetCheck(${i}, ${exercise.rest})"></div>
      </div>`).join('')}
    <div style="margin-top:4px;font-size:12px;color:var(--text3)">Tap ✓ to mark set done · rest timer starts automatically</div>
  `;
}

function renderCardioSessionInputs(exercise) {
  return `
    <div class="form-group" style="margin-top:8px">
      <label class="form-label">Duration (minutes)</label>
      <input class="set-input" type="number" id="cardio-session-duration" placeholder="30" style="width:100%" />
    </div>
    <div class="form-group">
      <label class="form-label">Distance (km, optional)</label>
      <input class="set-input" type="number" id="cardio-session-distance" placeholder="5" step="0.1" style="width:100%" />
    </div>
    <div class="form-group">
      <label class="form-label">Intensity (1-10, optional)</label>
      <input class="set-input" type="number" id="cardio-session-intensity" placeholder="7" min="1" max="10" style="width:100%" />
    </div>
  `;
}

function toggleSetCheck(i, rest) {
  const check = document.getElementById('set-check-' + i);
  const num = document.getElementById('set-num-' + i);
  const isDone = check.classList.toggle('checked');
  num.classList.toggle('done', isDone);
  if (isDone && rest > 0) startRestTimer(rest);
}

let timerInterval;
function startRestTimer(seconds) {
  const box = document.getElementById('rest-timer-box');
  const display = document.getElementById('timer-display');
  if (!box || !display) return;
  clearInterval(timerInterval);
  box.classList.add('active', 'pulsing');
  let remaining = seconds;
  display.textContent = formatTime(remaining);
  timerInterval = setInterval(() => {
    remaining--;
    display.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      box.classList.remove('active', 'pulsing');
      toast('⏱ Rest done! Next set!');
    }
  }, 1000);
}

function skipTimer() {
  clearInterval(timerInterval);
  document.getElementById('rest-timer-box')?.classList.remove('active', 'pulsing');
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function saveSession() {
  const ex = state.activeSession?.exercise;
  if (!ex) return;
  const isCardio = ex.isCardio;
  let sessionData;

  if (isCardio) {
    const duration = parseInt(document.getElementById('cardio-session-duration')?.value) || 0;
    const distance = parseFloat(document.getElementById('cardio-session-distance')?.value) || null;
    const intensity = parseInt(document.getElementById('cardio-session-intensity')?.value) || null;
    if (!duration) { toast('Please enter a duration'); return; }
    sessionData = {
      id: 'sess_' + Date.now(),
      name: ex.name, date: new Date().toISOString(),
      type: 'cardio',
      exercises: [{ name: ex.name, duration, distance, intensity }],
      totalSets: 1,
    };
    // Also log to cardio log
    const cardioLog = getData().cardioLog;
    cardioLog.push({ type: ex.name, duration, distance, calories: null, date: new Date().toISOString() });
    DB.set('cardioLog', cardioLog);
  } else {
    const sets = ex.sets || 3;
    const loggedSets = [];
    let maxWeight = 0;
    for (let i = 0; i < sets; i++) {
      const w = parseFloat(document.getElementById('set-weight-' + i)?.value) || 0;
      const r = parseInt(document.getElementById('set-reps-' + i)?.value) || 0;
      const done = document.getElementById('set-check-' + i)?.classList.contains('checked');
      loggedSets.push({ weight: w, reps: r, done });
      if (w > maxWeight) maxWeight = w;
    }
    const doneSets = loggedSets.filter(s => s.done).length;
    if (doneSets === 0) { toast('Complete at least one set!'); return; }

    // Update PRs
    const prs = getData().prs;
    if (!prs[ex.id] || maxWeight > prs[ex.id].weight) {
      prs[ex.id] = { weight: maxWeight, date: new Date().toISOString(), name: ex.name };
      DB.set('prs', prs);
      toast('🏆 New PR! ' + maxWeight + 'kg');
    }

    sessionData = {
      id: 'sess_' + Date.now(),
      name: ex.name, date: new Date().toISOString(),
      type: 'strength',
      exercises: [{ id: ex.id, name: ex.name, sets: loggedSets }],
      totalSets: doneSets,
      maxWeight,
    };
  }

  const sessions = getData().sessions;
  sessions.push(sessionData);
  DB.set('sessions', sessions);
  skipTimer();
  closeModal('session-modal');
  toast('Session saved! 💪');
  if (state.currentPage === 'progress') renderProgress();
  if (state.currentPage === 'home') renderDashboard();
}

// ─── Progress ─────────────────────────────────────────────

function renderProgress() {
  const { sessions, prs } = getData();
  populateChartSelect(sessions);
  renderChart();
  renderPRs(prs);
  renderSessionHistory(sessions);
}

function populateChartSelect(sessions) {
  const select = document.getElementById('chart-exercise-select');
  const ids = [...new Set(sessions.filter(s => s.type === 'strength').flatMap(s => s.exercises.map(e => e.id || e.name)))];
  const exerciseMap = {};
  sessions.filter(s => s.type === 'strength').forEach(s => s.exercises.forEach(e => { exerciseMap[e.id || e.name] = e.name; }));
  const prev = select.value;
  select.innerHTML = ids.length ? ids.map(id => `<option value="${id}">${escHtml(exerciseMap[id] || id)}</option>`).join('') : '<option value="">No data yet</option>';
  if (prev && ids.includes(prev)) select.value = prev;
}

let chartInstance = null;
function renderChart() {
  const select = document.getElementById('chart-exercise-select');
  const exId = select.value;
  const { sessions } = getData();
  const canvas = document.getElementById('progress-chart');

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  if (!exId) return;

  const dataPoints = [];
  sessions.filter(s => s.type === 'strength').forEach(s => {
    s.exercises.forEach(e => {
      if ((e.id || e.name) === exId) {
        const maxW = Math.max(...(e.sets || []).map(st => st.weight || 0).filter(w => w > 0));
        if (maxW > 0) dataPoints.push({ x: formatDate(s.date), y: maxW });
      }
    });
  });

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: dataPoints.map(d => d.x),
      datasets: [{
        label: 'Max Weight (kg)',
        data: dataPoints.map(d => d.y),
        borderColor: '#00E5A0',
        backgroundColor: 'rgba(0,229,160,0.1)',
        pointBackgroundColor: '#00E5A0',
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8888A0', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#8888A0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function renderPRs(prs) {
  const el = document.getElementById('prs-list');
  const entries = Object.entries(prs);
  if (!entries.length) { el.innerHTML = '<p class="muted-text">Complete sessions to see your PRs.</p>'; return; }
  el.innerHTML = entries.sort((a,b) => new Date(b[1].date) - new Date(a[1].date)).map(([,pr]) => `
    <div class="pr-card">
      <div>
        <div class="pr-name">${escHtml(pr.name)}</div>
        <div class="pr-date">${formatDate(pr.date)}</div>
      </div>
      <div class="pr-weight">${pr.weight}kg</div>
    </div>`).join('');
}

function renderSessionHistory(sessions) {
  const el = document.getElementById('session-history-list');
  if (!sessions.length) { el.innerHTML = '<p class="muted-text">No sessions logged yet.</p>'; return; }
  el.innerHTML = [...sessions].reverse().map(s => sessionCardHTML(s)).join('');
}

// ─── Goals ────────────────────────────────────────────────

function renderGoals() {
  renderWeeklyGoals();
  renderWeightLossGoal();
  renderCardioGoals();
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

// Weekly Goals
document.getElementById('add-goal-btn').onclick = () => {
  const allEx = [...EXERCISE_LIBRARY, ...getData().customWorkouts];
  const select = document.getElementById('gm-exercise');
  select.innerHTML = allEx.map(e => `<option value="${e.id}">${escHtml(e.name)}</option>`).join('');
  document.getElementById('gm-weight').value = '';
  openModal('goal-modal');
};

function saveGoal() {
  const exId = document.getElementById('gm-exercise').value;
  const weight = parseFloat(document.getElementById('gm-weight').value);
  if (!weight) { toast('Enter a target weight'); return; }
  const allEx = [...EXERCISE_LIBRARY, ...getData().customWorkouts];
  const ex = allEx.find(e => e.id === exId);
  const goals = getData().weeklyGoals;
  const weekStart = getWeekStart();
  const existing = goals.findIndex(g => g.exId === exId && g.weekStart === weekStart);
  const goal = { id: 'goal_' + Date.now(), exId, exName: ex?.name || exId, targetWeight: weight, weekStart, createdAt: new Date().toISOString() };
  if (existing >= 0) goals[existing] = goal;
  else goals.push(goal);
  DB.set('weeklyGoals', goals);
  closeModal('goal-modal');
  toast('Goal set!');
  renderWeeklyGoals();
}

function renderWeeklyGoals() {
  const { weeklyGoals, prs } = getData();
  const el = document.getElementById('weekly-goals-list');
  const weekStart = getWeekStart();
  const thisWeek = weeklyGoals.filter(g => g.weekStart === weekStart);
  if (!thisWeek.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🎯</span><p>Set a weight target for any exercise this week.</p></div>`;
    return;
  }
  el.innerHTML = thisWeek.map(g => {
    const current = prs[g.exId]?.weight || 0;
    const pct = Math.min(100, Math.round((current / g.targetWeight) * 100));
    const hit = current >= g.targetWeight;
    return `
      <div class="goal-card">
        <div class="goal-card-row">
          <div>
            <div class="goal-name">${escHtml(g.exName)} ${hit ? '🏆' : ''}</div>
            <div class="goal-sub">Current: ${current}kg · Target: ${g.targetWeight}kg</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="goal-pct">${pct}%</span>
            <button class="btn btn-sm btn-danger" onclick="deleteGoal('${g.id}')">✕</button>
          </div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar ${hit ? '' : ''}" style="width:${pct}%;background:${hit ? '#FFB830' : 'var(--accent)'}"></div>
        </div>
      </div>`;
  }).join('');
}

function deleteGoal(id) {
  DB.set('weeklyGoals', getData().weeklyGoals.filter(g => g.id !== id));
  toast('Goal removed');
  renderWeeklyGoals();
}

// Weight Loss Goal
function saveWeightLossGoal() {
  const current = parseFloat(document.getElementById('wl-current').value);
  const target = parseFloat(document.getElementById('wl-target').value);
  const date = document.getElementById('wl-date').value;
  if (!current || !target || !date) { toast('Fill in all fields'); return; }
  if (target >= current) { toast('Target should be less than current weight'); return; }
  DB.set('weightLossGoal', { currentWeight: current, targetWeight: target, targetDate: date, createdAt: new Date().toISOString() });
  toast('Weight loss goal saved!');
  renderWeightLossGoal();
}

function logWeight() {
  const w = parseFloat(document.getElementById('wl-log-weight').value);
  if (!w) { toast('Enter a weight'); return; }
  const log = getData().weightLog;
  log.push({ weight: w, date: new Date().toISOString() });
  DB.set('weightLog', log);
  document.getElementById('wl-log-weight').value = '';
  toast('Weight logged!');
  renderWeightLossGoal();
  renderDashboard();
}

function renderWeightLossGoal() {
  const { weightLossGoal, weightLog } = getData();

  // Pre-fill form
  if (weightLossGoal) {
    document.getElementById('wl-current').value = weightLossGoal.currentWeight;
    document.getElementById('wl-target').value = weightLossGoal.targetWeight;
    document.getElementById('wl-date').value = weightLossGoal.targetDate;
  }

  const displayEl = document.getElementById('wl-progress-display');
  const historyEl = document.getElementById('wl-history');

  if (weightLossGoal && weightLog.length > 0) {
    const latest = weightLog[weightLog.length - 1].weight;
    const start = weightLossGoal.currentWeight;
    const target = weightLossGoal.targetWeight;
    const lost = Math.max(0, start - latest).toFixed(1);
    const toGo = Math.max(0, latest - target).toFixed(1);
    const pct = Math.min(100, Math.max(0, ((start - latest) / (start - target)) * 100));
    const daysLeft = Math.ceil((new Date(weightLossGoal.targetDate) - new Date()) / 86400000);

    displayEl.innerHTML = `
      <div class="wl-summary">
        <div class="goal-card-row">
          <span class="card-title">⚖️ Progress</span>
          <span style="font-size:18px;font-weight:800;color:var(--accent2)">${Math.round(pct)}%</span>
        </div>
        <div class="wl-nums">
          <div class="wl-num-block"><span class="wl-num-val">${latest}kg</span><span class="wl-num-label">Current</span></div>
          <div class="wl-num-block"><span class="wl-num-val">${lost}kg</span><span class="wl-num-label">Lost</span></div>
          <div class="wl-num-block"><span class="wl-num-val">${toGo}kg</span><span class="wl-num-label">To Go</span></div>
          <div class="wl-num-block"><span class="wl-num-val">${daysLeft > 0 ? daysLeft : 0}</span><span class="wl-num-label">Days Left</span></div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar progress-bar--alt" style="width:${pct}%"></div>
        </div>
      </div>`;
  } else if (weightLossGoal) {
    displayEl.innerHTML = `<div class="card"><p class="muted-text">Log your weight to track progress.</p></div>`;
  } else {
    displayEl.innerHTML = '';
  }

  // History
  historyEl.innerHTML = [...weightLog].reverse().slice(0, 10).map(entry => `
    <div class="weight-log-item">
      <span class="weight-log-val">${entry.weight} kg</span>
      <span class="weight-log-date">${formatDate(entry.date)}</span>
    </div>`).join('') || '<p class="muted-text">No weight entries yet.</p>';
}

// Cardio Goals
function saveCardioGoal() {
  const minutes = parseInt(document.getElementById('cardio-goal-min').value) || 0;
  const sessions = parseInt(document.getElementById('cardio-goal-sessions').value) || 0;
  if (!minutes && !sessions) { toast('Enter at least one goal'); return; }
  DB.set('cardioGoal', { minutesPerWeek: minutes, sessionsPerWeek: sessions, createdAt: new Date().toISOString() });
  toast('Cardio goal saved!');
  renderCardioGoals();
}

function logCardio() {
  const type = document.getElementById('cardio-log-type').value;
  const duration = parseInt(document.getElementById('cardio-log-duration').value) || 0;
  const distance = parseFloat(document.getElementById('cardio-log-distance').value) || null;
  const calories = parseInt(document.getElementById('cardio-log-calories').value) || null;
  if (!duration) { toast('Enter duration'); return; }
  const log = getData().cardioLog;
  log.push({ type, duration, distance, calories, date: new Date().toISOString() });
  DB.set('cardioLog', log);
  document.getElementById('cardio-log-duration').value = '';
  document.getElementById('cardio-log-distance').value = '';
  document.getElementById('cardio-log-calories').value = '';
  toast('Cardio logged! 🏃');
  renderCardioGoals();
}

function renderCardioGoals() {
  const { cardioGoal, cardioLog } = getData();

  if (cardioGoal) {
    document.getElementById('cardio-goal-min').value = cardioGoal.minutesPerWeek || '';
    document.getElementById('cardio-goal-sessions').value = cardioGoal.sessionsPerWeek || '';
  }

  const weekStart = getWeekStart();
  const thisWeekCardio = cardioLog.filter(c => c.date >= weekStart);
  const totalMin = thisWeekCardio.reduce((a, c) => a + c.duration, 0);
  const totalSessions = thisWeekCardio.length;

  const progressEl = document.getElementById('cardio-goal-progress');
  if (cardioGoal) {
    const minPct = cardioGoal.minutesPerWeek ? Math.min(100, Math.round((totalMin / cardioGoal.minutesPerWeek) * 100)) : 0;
    const sessPct = cardioGoal.sessionsPerWeek ? Math.min(100, Math.round((totalSessions / cardioGoal.sessionsPerWeek) * 100)) : 0;
    progressEl.innerHTML = `
      <div class="cardio-summary-row">
        <div class="goal-card">
          <div class="goal-name">⏱ Minutes</div>
          <div class="goal-pct" style="font-size:22px;margin:6px 0">${totalMin}<span style="font-size:13px;color:var(--text2)">/${cardioGoal.minutesPerWeek || '?'}</span></div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${minPct}%"></div></div>
        </div>
        <div class="goal-card">
          <div class="goal-name">🏃 Sessions</div>
          <div class="goal-pct" style="font-size:22px;margin:6px 0">${totalSessions}<span style="font-size:13px;color:var(--text2)">/${cardioGoal.sessionsPerWeek || '?'}</span></div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${sessPct}%"></div></div>
        </div>
      </div>`;
  } else {
    progressEl.innerHTML = `<div class="card" style="margin-bottom:16px"><p class="muted-text">Set a cardio goal above to track progress.</p></div>`;
  }

  const historyEl = document.getElementById('cardio-history');
  if (!thisWeekCardio.length) {
    historyEl.innerHTML = '<p class="muted-text">No cardio logged this week.</p>';
    return;
  }
  historyEl.innerHTML = [...thisWeekCardio].reverse().map(c => `
    <div class="cardio-card">
      <span class="cardio-icon">${CARDIO_EMOJIS[c.type] || '💪'}</span>
      <div class="cardio-info">
        <div class="cardio-name">${escHtml(c.type)}</div>
        <div class="cardio-meta">
          ${c.distance ? `${c.distance}km · ` : ''}${c.calories ? `${c.calories} kcal · ` : ''}${formatDate(c.date)}
        </div>
      </div>
      <div class="cardio-duration">${c.duration}min</div>
    </div>`).join('');
}

// ─── Water ────────────────────────────────────────────────

function renderWater() {
  const { settings, waterLog } = getData();
  const goal = settings.waterGoal || 2000;
  const today = getTodayWater(waterLog);
  const pct = Math.min(100, (today / goal) * 100);

  document.getElementById('water-fill').style.height = pct + '%';
  document.getElementById('water-current-ml').textContent = today;
  document.getElementById('water-goal-display').textContent = goal;
  document.getElementById('water-goal-input').value = goal;
  document.getElementById('water-pct').textContent = Math.round(pct) + '%';

  // Log
  const todayLogs = waterLog.filter(l => l.date.startsWith(new Date().toISOString().split('T')[0]));
  const el = document.getElementById('water-log-list');
  el.innerHTML = todayLogs.length
    ? [...todayLogs].reverse().map(l => `
        <div class="water-log-item">
          <span class="water-log-amount">+${l.amount}ml</span>
          <span class="water-log-time">${formatTime12(l.date)}</span>
        </div>`).join('')
    : '<p class="muted-text">No water logged today yet.</p>';
}

function getTodayWater(waterLog) {
  const today = new Date().toISOString().split('T')[0];
  return waterLog.filter(l => l.date.startsWith(today)).reduce((a, l) => a + l.amount, 0);
}

function addWater(ml) {
  const log = getData().waterLog;
  log.push({ amount: ml, date: new Date().toISOString() });
  DB.set('waterLog', log);
  toast(`+${ml}ml 💧`);
  renderWater();
  updateDashWater();
}

function addWaterCustom() {
  const val = parseInt(document.getElementById('water-custom-amount').value);
  if (!val || val <= 0) { toast('Enter a valid amount'); return; }
  document.getElementById('water-custom-amount').value = '';
  addWater(val);
}

function setWaterGoal() {
  const goal = parseInt(document.getElementById('water-goal-input').value);
  if (!goal || goal <= 0) { toast('Enter a valid goal'); return; }
  const settings = getData().settings;
  settings.waterGoal = goal;
  DB.set('settings', settings);
  toast('Water goal updated!');
  renderWater();
}

function resetWater() {
  if (!confirm('Reset today\'s water intake?')) return;
  const today = new Date().toISOString().split('T')[0];
  const log = getData().waterLog.filter(l => !l.date.startsWith(today));
  DB.set('waterLog', log);
  toast('Water reset');
  renderWater();
}

function updateDashWater() {
  if (state.currentPage === 'home') renderDashboard();
}

// ─── Utilities ────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime12(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getWeekStart() {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString();
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Init ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateGreeting();
  renderDashboard();
  renderWorkouts();
});
