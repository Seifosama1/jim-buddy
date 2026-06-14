// Sound effects (after DB constant)
// Sound Manager is loaded from sounds.js

/* ══════════════════════════════════════════
   JIM BUDDY — App Logic (Complete)
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════ */

// Hide loading screen after page loads
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    // Add a slight delay to show the animation
    setTimeout(() => {
      loadingScreen.classList.add('hide');
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (loadingScreen && loadingScreen.parentNode) {
          loadingScreen.style.display = 'none';
        }
      }, 600);
    }, 1500); // Show loading screen for 1.5 seconds minimum
  }
}

// Ensure loading screen hides even if DOM loads super fast
window.addEventListener('load', hideLoadingScreen);

// Fallback: hide after 3 seconds max
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && !loadingScreen.classList.contains('hide')) {
    hideLoadingScreen();
  }
}, 3000);

// ─── Data Layer ───────────────────────────────────────────
const DB = {
  get: (key, def = null) => {
    try { const v = localStorage.getItem('jimbuddy_' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set: (key, val) => { try { localStorage.setItem('jimbuddy_' + key, JSON.stringify(val)); } catch {} },
};

// ─── Constants ───────────────────────────────────────────
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Food Database ───────────────────────────────────────
const FOOD_DATABASE = [
  { id: 'apple', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, serving: '1 medium' },
  { id: 'banana', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving: '1 medium' },
  { id: 'chicken-breast', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g' },
  { id: 'rice', name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: '100g' },
  { id: 'egg', name: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, serving: '1 large' },
  { id: 'oatmeal', name: 'Oatmeal', calories: 158, protein: 5.5, carbs: 27, fats: 3.2, serving: '1 cup cooked' },
  { id: 'salmon', name: 'Salmon', calories: 208, protein: 22, carbs: 0, fats: 13, serving: '100g' },
  { id: 'broccoli', name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g' },
  { id: 'sweet-potato', name: 'Sweet Potato', calories: 90, protein: 2, carbs: 21, fats: 0.1, serving: '100g' },
  { id: 'greek-yogurt', name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: '100g' },
  { id: 'protein-shake', name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: '1 scoop' },
  { id: 'avocado', name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fats: 15, serving: '100g' },
  { id: 'bread', name: 'Whole Wheat Bread', calories: 79, protein: 4, carbs: 13, fats: 1, serving: '1 slice' },
  { id: 'pasta', name: 'Pasta', calories: 158, protein: 5.8, carbs: 31, fats: 1.1, serving: '100g' },
  { id: 'cheese', name: 'Cheddar Cheese', calories: 404, protein: 25, carbs: 1.3, fats: 33, serving: '100g' },
  { id: 'milk', name: 'Milk (2%)', calories: 122, protein: 8, carbs: 12, fats: 5, serving: '1 cup' },
  { id: 'almonds', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 49, serving: '100g' },
  { id: 'coffee', name: 'Black Coffee', calories: 2, protein: 0, carbs: 0, fats: 0, serving: '1 cup' },
  { id: 'pizza', name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fats: 10, serving: '1 slice' },
  { id: 'burger', name: 'Hamburger', calories: 354, protein: 17, carbs: 29, fats: 19, serving: '1 burger' }
];

// ─── State ────────────────────────────────────────────────
let state = {
  currentPage: 'home',
  muscleFilter: 'All',
  editingWorkoutId: null,
  activeSession: null,
  restTimer: null,
  chart: null,
  editingScheduleDay: null,
  editingScheduleWorkoutIndex: null,
  scheduledSession: null,
  scheduledCurrentIndex: null,
  selectedFoodId: null,
  activeQueueIndex: null,  // Add this line
  lastCalculation: null     // Add this line
};

// ─── Helper Functions ────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

function openModal(id) { 
  document.getElementById(id).classList.add('open');
  SoundManager.modalOpen();
}function closeModal(id) { document.getElementById(id).classList.remove('open'); }

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ─── Data Access ─────────────────────────────────────────
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
    weeklySchedule: DB.get('weeklySchedule', { days: {} }),
    foodLog: DB.get('foodLog', []),
    calorieGoals: DB.get('calorieGoals', { calories: 2000, protein: 150, carbs: 200, fats: 55 }),
    customFoods: DB.get('customFoods', [])
  };
}

// ─── Calorie Tracker Functions ───────────────────────────
function getTodayFoodLog() {
  const { foodLog } = getData();
  const today = new Date().toISOString().split('T')[0];
  return foodLog.filter(item => item.date.startsWith(today));
}

function getDailyTotals() {
  const todayLog = getTodayFoodLog();
  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  todayLog.forEach(item => {
    totals.calories += item.calories * item.quantity;
    totals.protein += (item.protein || 0) * item.quantity;
    totals.carbs += (item.carbs || 0) * item.quantity;
    totals.fats += (item.fats || 0) * item.quantity;
  });
  return totals;
}

function renderCalorieTracker() {
  const { calorieGoals, customFoods } = getData();
  const totals = getDailyTotals();
  const todayLog = getTodayFoodLog();
  
  // Update summary
  document.getElementById('calorie-total').textContent = Math.round(totals.calories);
  const goalCal = calorieGoals?.calories || 2000;
  document.getElementById('calorie-goal-text').textContent = goalCal;
  const percent = Math.min(100, (totals.calories / goalCal) * 100);
  document.getElementById('calorie-progress-bar').style.width = percent + '%';
  
  // Update macros
  document.getElementById('protein-total').textContent = Math.round(totals.protein);
  document.getElementById('carbs-total').textContent = Math.round(totals.carbs);
  document.getElementById('fats-total').textContent = Math.round(totals.fats);
  
  // Quick food grid
  const quickFoods = FOOD_DATABASE.slice(0, 9);
  const quickGrid = document.getElementById('quick-food-grid');
  quickGrid.innerHTML = quickFoods.map(food => `
    <div class="quick-food-item" onclick="quickAddFood('${food.id}')">
      <span class="quick-food-name">${escHtml(food.name)}</span>
      <span class="quick-food-calories">${food.calories} kcal</span>
    </div>
  `).join('');
  
  // Food log list
  const logContainer = document.getElementById('food-log-list');
  if (todayLog.length === 0) {
    logContainer.innerHTML = '<p class="muted-text">No food logged today. Add your meals above!</p>';
  } else {
    logContainer.innerHTML = todayLog.map((item, idx) => `
      <div class="food-log-item">
        <div class="food-log-info">
          <div class="food-log-name">
            ${escHtml(item.name)}
            <span class="food-log-serving">${item.serving || '1 serving'} × ${item.quantity}</span>
          </div>
          <div class="food-log-nutrition">
            <span>🔥 ${Math.round(item.calories * item.quantity)} kcal</span>
            <span>💪 ${(item.protein || 0) * item.quantity}g protein</span>
            <span>🍚 ${(item.carbs || 0) * item.quantity}g carbs</span>
            <span>🧈 ${(item.fats || 0) * item.quantity}g fats</span>
          </div>
        </div>
        <div class="food-log-actions">
          <button class="food-delete-btn" onclick="deleteFoodEntry(${idx})">🗑</button>
        </div>
      </div>
    `).join('');
  }
  
  // Meal suggestions
  const mealGrid = document.getElementById('meal-suggestions-grid');
  const meals = [
    { name: '🍳 Breakfast: Eggs + Oats', foods: ['egg', 'oatmeal'] },
    { name: '🥗 Lunch: Chicken + Rice', foods: ['chicken-breast', 'rice', 'broccoli'] },
    { name: '🍌 Snack: Banana + Protein', foods: ['banana', 'protein-shake'] },
    { name: '🐟 Dinner: Salmon + Veggies', foods: ['salmon', 'sweet-potato', 'broccoli'] }
  ];
  mealGrid.innerHTML = meals.map(meal => `
    <div class="meal-suggestion" onclick="addMealSuggestion('${meal.foods.join(',')}')">
      <span class="meal-suggestion-name">${meal.name}</span>
    </div>
  `).join('');
}

function quickAddFood(foodId) {
  const food = FOOD_DATABASE.find(f => f.id === foodId);
  if (food) {
    state.selectedFoodId = foodId;
    document.getElementById('food-quantity').value = 1;
    openAddFoodModal();
  }
}

function openAddFoodModal() {
  document.getElementById('food-search-input').value = '';
  document.getElementById('custom-food-name').value = '';
  document.getElementById('custom-calories').value = '';
  document.getElementById('custom-protein').value = '';
  document.getElementById('custom-carbs').value = '';
  document.getElementById('custom-fats').value = '';
  document.getElementById('custom-serving').value = '1 serving';
  document.getElementById('food-quantity').value = 1;
  filterFoodList();
  openModal('add-food-modal');
}

function filterFoodList() {
  const searchTerm = document.getElementById('food-search-input').value.toLowerCase();
  const { customFoods } = getData();
  const allFoods = [...FOOD_DATABASE, ...customFoods];
  const filtered = allFoods.filter(food => 
    food.name.toLowerCase().includes(searchTerm)
  );
  
  const resultsDiv = document.getElementById('food-search-results');
  resultsDiv.innerHTML = filtered.map(food => `
    <div class="food-search-item" onclick="selectFoodFromSearch('${food.id}')">
      <div>
        <div class="food-search-name">${escHtml(food.name)}</div>
        <div class="food-search-serving">${food.serving || '1 serving'}</div>
      </div>
      <div class="food-search-calories">${food.calories} kcal</div>
    </div>
  `).join('');
}

function selectFoodFromSearch(foodId) {
  state.selectedFoodId = foodId;
  const allFoods = [...FOOD_DATABASE, ...(getData().customFoods || [])];
  const food = allFoods.find(f => f.id === foodId);
  if (food) {
    document.getElementById('food-quantity').focus();
  }
}

function addFoodToLog() {
  const allFoods = [...FOOD_DATABASE, ...(getData().customFoods || [])];
  let food = null;
  
  // Check if custom food
  const customName = document.getElementById('custom-food-name').value.trim();
  if (customName) {
    const calories = parseFloat(document.getElementById('custom-calories').value);
    const protein = parseFloat(document.getElementById('custom-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('custom-carbs').value) || 0;
    const fats = parseFloat(document.getElementById('custom-fats').value) || 0;
    const serving = document.getElementById('custom-serving').value.trim() || '1 serving';
    
    if (!calories) {
      toast('Please enter calories for custom food');
      return;
    }
    
    food = {
      id: 'custom_' + Date.now(),
      name: customName,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fats: fats,
      serving: serving
    };
    
    // Save custom food
    const { customFoods } = getData();
    customFoods.push(food);
    DB.set('customFoods', customFoods);
  } else if (state.selectedFoodId) {
    food = allFoods.find(f => f.id === state.selectedFoodId);
  }
  
  if (!food) {
    toast('Please select or create a food');
    return;
  }
  
  const quantity = parseFloat(document.getElementById('food-quantity').value) || 1;
  
  const foodLog = getData().foodLog;
  foodLog.push({
    id: 'food_' + Date.now(),
    name: food.name,
    calories: food.calories,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fats: food.fats || 0,
    serving: food.serving || '1 serving',
    quantity: quantity,
    date: new Date().toISOString()
  });
  
  DB.set('foodLog', foodLog);
  closeModal('add-food-modal');
  renderCalorieTracker();
  toast(`Added ${quantity} × ${food.name}`);
}

function deleteFoodEntry(index) {
  const foodLog = getData().foodLog;
  const todayLog = getTodayFoodLog();
  const actualEntry = todayLog[index];
  if (actualEntry) {
    const actualIndex = foodLog.findIndex(item => item.id === actualEntry.id);
    if (actualIndex !== -1) {
      foodLog.splice(actualIndex, 1);
      DB.set('foodLog', foodLog);
      renderCalorieTracker();
      toast('Entry removed');
    }
  }
}

function resetTodayFood() {
  if (confirm('Reset all food entries for today?')) {
    const today = new Date().toISOString().split('T')[0];
    const foodLog = getData().foodLog.filter(item => !item.date.startsWith(today));
    DB.set('foodLog', foodLog);
    renderCalorieTracker();
    toast('Today\'s food log reset');
  }
}

function addMealSuggestion(foodIds) {
  const ids = foodIds.split(',');
  ids.forEach(id => {
    const food = FOOD_DATABASE.find(f => f.id === id);
    if (food) {
      const foodLog = getData().foodLog;
      foodLog.push({
        id: 'food_' + Date.now() + '_' + Math.random(),
        name: food.name,
        calories: food.calories,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fats: food.fats || 0,
        serving: food.serving || '1 serving',
        quantity: 1,
        date: new Date().toISOString()
      });
      DB.set('foodLog', foodLog);
    }
  });
  renderCalorieTracker();
  toast('Meal added!');
}

function openCalorieGoalModal() {
  const { calorieGoals } = getData();
  document.getElementById('calorie-goal-input').value = calorieGoals?.calories || 2000;
  document.getElementById('protein-goal-input').value = calorieGoals?.protein || 150;
  document.getElementById('carbs-goal-input').value = calorieGoals?.carbs || 200;
  document.getElementById('fats-goal-input').value = calorieGoals?.fats || 55;
  openModal('calorie-goal-modal');
}

function saveCalorieGoals() {
  const goals = {
    calories: parseInt(document.getElementById('calorie-goal-input').value) || 2000,
    protein: parseInt(document.getElementById('protein-goal-input').value) || 150,
    carbs: parseInt(document.getElementById('carbs-goal-input').value) || 200,
    fats: parseInt(document.getElementById('fats-goal-input').value) || 55
  };
  DB.set('calorieGoals', goals);
  closeModal('calorie-goal-modal');
  renderCalorieTracker();
  toast('Goals updated!');
}

// ─── Weekly Schedule Functions ───────────────────────────
function getWeeklySchedule() {
  const schedule = DB.get('weeklySchedule', null);
  if (!schedule || !schedule.days) {
    return { 
      days: {
        Monday: { name: '', workouts: [] },
        Tuesday: { name: '', workouts: [] },
        Wednesday: { name: '', workouts: [] },
        Thursday: { name: '', workouts: [] },
        Friday: { name: '', workouts: [] },
        Saturday: { name: '', workouts: [] },
        Sunday: { name: '', workouts: [] }
      },
      active: true
    };
  }
  return schedule;
}

function saveWeeklySchedule(schedule) {
  DB.set('weeklySchedule', schedule);
}

function renderWeeklySchedule() {
  const schedule = getWeeklySchedule();
  const container = document.getElementById('weekly-schedule-grid');
  if (!container) return;

  container.innerHTML = DAYS_OF_WEEK.map(day => {
    const dayData = schedule.days[day] || { name: '', workouts: [] };
    const workoutsCount = dayData.workouts?.length || 0;
    const hasName = dayData.name && dayData.name.trim() !== '';
    
    return `
      <div class="schedule-day-card" data-day="${day}">
        <div class="schedule-day-header">
          <span class="schedule-day-name">${day}</span>
          <span class="schedule-workout-count">${workoutsCount} exercise${workoutsCount !== 1 ? 's' : ''}</span>
        </div>
        ${hasName ? `<div class="schedule-day-workout-name">🏋️ ${escHtml(dayData.name)}</div>` : ''}
        <div class="schedule-day-preview">
          ${dayData.workouts?.slice(0, 3).map(w => `<span class="schedule-exercise-tag">${escHtml(w.name)}</span>`).join('') || '<span class="muted">No exercises</span>'}
          ${workoutsCount > 3 ? `<span class="schedule-exercise-tag">+${workoutsCount - 3} more</span>` : ''}
        </div>
        <div class="schedule-day-actions">
          <button class="btn btn-sm btn-ghost" onclick="editScheduleDay('${day}')">✏️ Edit</button>
          <button class="btn btn-sm btn-primary" onclick="startScheduledWorkout('${day}')">▶ Start</button>
        </div>
      </div>
    `;
  }).join('');
}

function editScheduleDay(day) {
  const schedule = getWeeklySchedule();
  const dayData = schedule.days[day] || { name: '', workouts: [] };
  
  state.editingScheduleDay = day;
  
  const dayNameInput = document.getElementById('schedule-day-name');
  if (dayNameInput) {
    dayNameInput.value = dayData.name || '';
  }
  
  renderScheduleWorkoutList(dayData.workouts || []);
  renderAvailableExercises('');
  
  openModal('schedule-modal');
}

function renderScheduleWorkoutList(workouts) {
  const container = document.getElementById('schedule-workout-list');
  if (!container) return;
  
  const day = state.editingScheduleDay;
  
  if (!workouts.length) {
    container.innerHTML = '<p class="muted-text" style="text-align:center;padding:20px;">No exercises added yet.<br>Tap + below to add exercises.</p>';
    return;
  }
  
  container.innerHTML = workouts.map((w, idx) => `
    <div class="schedule-workout-row">
      <div class="schedule-workout-info" onclick="editScheduledWorkout('${day}', ${idx})" style="cursor:pointer;flex:1">
        <span class="schedule-workout-name">${escHtml(w.name)}</span>
        <span class="schedule-workout-detail">${w.sets || 3} sets × ${w.reps || 10} reps · ${w.rest || 60}s rest</span>
        ${w.notes ? `<span class="schedule-workout-notes" style="font-size:10px;color:var(--text3);display:block;margin-top:4px;">📝 ${escHtml(w.notes.substring(0, 40))}${w.notes.length > 40 ? '...' : ''}</span>` : ''}
      </div>
      <div class="schedule-workout-actions">
        <button class="icon-btn-small" onclick="editScheduledWorkout('${day}', ${idx})" title="Edit">✏️</button>
        <button class="icon-btn-small" onclick="removeWorkoutFromSchedule(${idx})" title="Remove">✕</button>
      </div>
    </div>
  `).join('');
}

function renderAvailableExercises(searchQuery = '') {
  const container = document.getElementById('schedule-available-exercises');
  if (!container) return;
  
  const allExercises = [...EXERCISE_LIBRARY, ...(getData().customWorkouts || [])];
  let filtered = allExercises;
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(q) || 
      (ex.muscle && ex.muscle.toLowerCase().includes(q))
    );
  }
  
  container.innerHTML = filtered.map(ex => `
    <div class="schedule-exercise-item" onclick="addWorkoutToScheduleDay('${ex.id.replace(/'/g, "\\'")}', '${escHtml(ex.name).replace(/'/g, "\\'")}')">
      <span class="schedule-exercise-icon">${ex.isCardio ? '🏃' : '💪'}</span>
      <div class="schedule-exercise-info">
        <div class="schedule-exercise-name">${escHtml(ex.name)}</div>
        <div class="schedule-exercise-meta">${ex.muscle || (ex.isCardio ? 'Cardio' : 'Strength')}</div>
      </div>
      <span class="schedule-add-icon">+</span>
    </div>
  `).join('');
}

function filterScheduleExercises() {
  const query = document.getElementById('schedule-exercise-search')?.value || '';
  renderAvailableExercises(query);
}

function addWorkoutToScheduleDay(exerciseId, exerciseName) {
  const allExercises = [...EXERCISE_LIBRARY, ...(getData().customWorkouts || [])];
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;
  
  const schedule = getWeeklySchedule();
  const day = state.editingScheduleDay;
  
  if (!day) {
    toast('Please select a day first');
    return;
  }
  
  if (!schedule.days[day]) {
    schedule.days[day] = { name: '', workouts: [] };
  }
  
  schedule.days[day].workouts.push({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets || 3,
    reps: exercise.reps || 10,
    rest: exercise.rest || 60,
    isCardio: exercise.isCardio || false,
    muscle: exercise.muscle || 'General',
    notes: ''
  });
  
  saveWeeklySchedule(schedule);
  renderScheduleWorkoutList(schedule.days[day].workouts);
  toast(`Added ${exercise.name} to ${day}`);
}

function removeWorkoutFromSchedule(index) {
  const schedule = getWeeklySchedule();
  const day = state.editingScheduleDay;
  if (schedule.days[day] && schedule.days[day].workouts[index]) {
    const removed = schedule.days[day].workouts[index];
    schedule.days[day].workouts.splice(index, 1);
    saveWeeklySchedule(schedule);
    renderScheduleWorkoutList(schedule.days[day].workouts);
    renderWeeklySchedule();
    toast(`Removed ${removed.name}`);
  }
}

function saveScheduleDay() {
  const schedule = getWeeklySchedule();
  const day = state.editingScheduleDay;
  const dayNameInput = document.getElementById('schedule-day-name');
  const dayName = dayNameInput ? dayNameInput.value.trim() : '';
  
  if (!schedule.days[day]) {
    schedule.days[day] = { name: '', workouts: [] };
  }
  
  schedule.days[day].name = dayName;
  saveWeeklySchedule(schedule);
  closeModal('schedule-modal');
  renderWeeklySchedule();
  toast(`${day} workout saved!`);
}

function resetWeeklySchedule() {
  if (confirm('Reset your entire weekly schedule? This cannot be undone.')) {
    const emptySchedule = {
      days: {
        Monday: { name: '', workouts: [] },
        Tuesday: { name: '', workouts: [] },
        Wednesday: { name: '', workouts: [] },
        Thursday: { name: '', workouts: [] },
        Friday: { name: '', workouts: [] },
        Saturday: { name: '', workouts: [] },
        Sunday: { name: '', workouts: [] }
      },
      active: true
    };
    saveWeeklySchedule(emptySchedule);
    renderWeeklySchedule();
    toast('Schedule reset!');
  }
}

// ─── Edit Scheduled Workout Functions ────────────────────
function editScheduledWorkout(day, workoutIndex) {
  const schedule = getWeeklySchedule();
  const dayData = schedule.days[day];
  
  if (!dayData || !dayData.workouts[workoutIndex]) {
    toast('Workout not found');
    return;
  }
  
  const workout = dayData.workouts[workoutIndex];
  
  state.editingScheduleDay = day;
  state.editingScheduleWorkoutIndex = workoutIndex;
  
  document.getElementById('edit-workout-sets').value = workout.sets || 3;
  document.getElementById('edit-workout-reps').value = workout.reps || 10;
  document.getElementById('edit-workout-rest').value = workout.rest || 60;
  document.getElementById('edit-workout-notes').value = workout.notes || '';
  
  const headerEl = document.getElementById('edit-workout-header');
  if (headerEl) {
    headerEl.innerHTML = `
      <div class="edit-workout-icon">${workout.isCardio ? '🏃' : '💪'}</div>
      <div class="edit-workout-title">
        <h4>${escHtml(workout.name)}</h4>
        <p>${workout.muscle || (workout.isCardio ? 'Cardio' : 'Strength')}</p>
      </div>
    `;
  }
  
  openModal('edit-schedule-workout-modal');
}

function saveScheduleWorkoutEdit() {
  const day = state.editingScheduleDay;
  const workoutIndex = state.editingScheduleWorkoutIndex;
  
  if (!day || workoutIndex === null) {
    toast('Error: No workout selected');
    closeModal('edit-schedule-workout-modal');
    return;
  }
  
  const schedule = getWeeklySchedule();
  const dayData = schedule.days[day];
  
  if (!dayData || !dayData.workouts[workoutIndex]) {
    toast('Workout not found');
    closeModal('edit-schedule-workout-modal');
    return;
  }
  
  const newSets = parseInt(document.getElementById('edit-workout-sets').value) || 3;
  const newReps = parseInt(document.getElementById('edit-workout-reps').value) || 10;
  const newRest = parseInt(document.getElementById('edit-workout-rest').value) || 60;
  const newNotes = document.getElementById('edit-workout-notes').value.trim();
  
  dayData.workouts[workoutIndex] = {
    ...dayData.workouts[workoutIndex],
    sets: newSets,
    reps: newReps,
    rest: newRest,
    notes: newNotes
  };
  
  saveWeeklySchedule(schedule);
  renderScheduleWorkoutList(dayData.workouts);
  renderWeeklySchedule();
  
  closeModal('edit-schedule-workout-modal');
  toast(`Updated ${dayData.workouts[workoutIndex].name}`);
}

function deleteScheduledWorkout() {
  const day = state.editingScheduleDay;
  const workoutIndex = state.editingScheduleWorkoutIndex;
  
  if (!day || workoutIndex === null) return;
  
  if (!confirm('Remove this exercise from your schedule?')) return;
  
  const schedule = getWeeklySchedule();
  const dayData = schedule.days[day];
  
  if (dayData && dayData.workouts[workoutIndex]) {
    const removedName = dayData.workouts[workoutIndex].name;
    dayData.workouts.splice(workoutIndex, 1);
    saveWeeklySchedule(schedule);
    
    renderScheduleWorkoutList(dayData.workouts);
    renderWeeklySchedule();
    
    closeModal('edit-schedule-workout-modal');
    toast(`Removed ${removedName} from schedule`);
  }
}

// ─── Start Scheduled Workout ─────────────────────────────
function startScheduledWorkout(day) {
  const schedule = getWeeklySchedule();
  const dayData = schedule.days[day];
  
  if (!dayData.workouts || dayData.workouts.length === 0) {
    toast(`No exercises scheduled for ${day}. Edit the day to add exercises.`);
    return;
  }
  
  state.scheduledSession = {
    day: day,
    name: dayData.name || `${day} Workout`,
    workouts: dayData.workouts,
    currentIndex: 0
  };
  
  startScheduledExercise(0);
}

function startScheduledExercise(index) {
  const session = state.scheduledSession;
  if (!session || index >= session.workouts.length) {
    toast("🎉 Great workout! All exercises completed!");
    closeModal('session-modal');
    state.scheduledSession = null;
    return;
  }
  
  const exercise = session.workouts[index];
  state.scheduledCurrentIndex = index;
  
  openScheduledSessionModal(exercise);
}

function openScheduledSessionModal(exercise) {
  state.activeSession = { 
    exercise, 
    sets: [], 
    isScheduled: true, 
    scheduledIndex: state.scheduledCurrentIndex 
  };
  
  const titleEl = document.getElementById('session-modal-title');
  if (titleEl) {
    titleEl.textContent = `${exercise.name} (${state.scheduledSession?.day || 'Workout'})`;
  }
  
  const body = document.getElementById('session-modal-body');
  const sets = exercise.sets || 3;
  const isCardio = exercise.isCardio;
  
  const total = state.scheduledSession.workouts.length;
  const current = (state.scheduledCurrentIndex || 0) + 1;
  
  body.innerHTML = `
    <div class="session-progress">
      <div class="session-progress-bar" style="width: ${(current/total)*100}%"></div>
      <div class="session-progress-text">Exercise ${current} of ${total}</div>
    </div>
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

// ─── Split Templates ─────────────────────────────────────
function getExercisesByNames(names) {
  const allExercises = [...EXERCISE_LIBRARY, ...(getData().customWorkouts || [])];
  return names.map(name => {
    const ex = allExercises.find(e => e.name === name);
    if (ex) {
      return {
        id: ex.id,
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        rest: ex.rest || 60,
        isCardio: ex.isCardio || false,
        muscle: ex.muscle || 'General',
        notes: ''
      };
    }
    return null;
  }).filter(Boolean);
}

function applySplitTemplate(template) {
  const schedule = getWeeklySchedule();
  
  switch(template) {
    case 'push-pull-legs':
      schedule.days = {
        Monday: { name: 'Push Day', workouts: getExercisesByNames(['Bench Press', 'Overhead Press', 'Lateral Raise', 'Tricep Pushdown']) },
        Tuesday: { name: 'Pull Day', workouts: getExercisesByNames(['Pull-Up', 'Barbell Row', 'Face Pull', 'Barbell Curl']) },
        Wednesday: { name: 'Legs Day', workouts: getExercisesByNames(['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise']) },
        Thursday: { name: 'Push Day', workouts: getExercisesByNames(['Incline Bench Press', 'Dumbbell Fly', 'Arnold Press', 'Skull Crusher']) },
        Friday: { name: 'Pull Day', workouts: getExercisesByNames(['Deadlift', 'Lat Pulldown', 'Seated Cable Row', 'Hammer Curl']) },
        Saturday: { name: 'Legs Day', workouts: getExercisesByNames(['Leg Curl', 'Leg Extension', 'Lunges', 'Hack Squat']) },
        Sunday: { name: 'Rest Day', workouts: [] }
      };
      break;
    case 'upper-lower':
      schedule.days = {
        Monday: { name: 'Upper A', workouts: getExercisesByNames(['Bench Press', 'Pull-Up', 'Overhead Press', 'Barbell Row', 'Tricep Pushdown', 'Barbell Curl']) },
        Tuesday: { name: 'Lower A', workouts: getExercisesByNames(['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise']) },
        Wednesday: { name: 'Rest', workouts: [] },
        Thursday: { name: 'Upper B', workouts: getExercisesByNames(['Incline Bench Press', 'Lat Pulldown', 'Lateral Raise', 'Dumbbell Row', 'Skull Crusher', 'Hammer Curl']) },
        Friday: { name: 'Lower B', workouts: getExercisesByNames(['Deadlift', 'Leg Curl', 'Leg Extension', 'Lunges']) },
        Saturday: { name: 'Cardio/Core', workouts: getExercisesByNames(['Treadmill Run', 'Plank', 'Crunches']) },
        Sunday: { name: 'Rest', workouts: [] }
      };
      break;
    case 'bro-split':
      schedule.days = {
        Monday: { name: 'Chest Day', workouts: getExercisesByNames(['Bench Press', 'Incline Bench Press', 'Dumbbell Fly', 'Push-Up', 'Cable Crossover']) },
        Tuesday: { name: 'Back Day', workouts: getExercisesByNames(['Deadlift', 'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row']) },
        Wednesday: { name: 'Shoulders Day', workouts: getExercisesByNames(['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press']) },
        Thursday: { name: 'Legs Day', workouts: getExercisesByNames(['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Calf Raise']) },
        Friday: { name: 'Arms Day', workouts: getExercisesByNames(['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crusher', 'Preacher Curl']) },
        Saturday: { name: 'Cardio/Abs', workouts: getExercisesByNames(['Treadmill Run', 'Plank', 'Russian Twist', 'Hanging Leg Raise']) },
        Sunday: { name: 'Rest Day', workouts: [] }
      };
      break;
    case 'full-body':
      schedule.days = {
        Monday: { name: 'Full Body A', workouts: getExercisesByNames(['Squat', 'Bench Press', 'Pull-Up', 'Overhead Press', 'Deadlift']) },
        Tuesday: { name: 'Rest', workouts: [] },
        Wednesday: { name: 'Full Body B', workouts: getExercisesByNames(['Leg Press', 'Incline Bench', 'Barbell Row', 'Lateral Raise', 'Romanian Deadlift']) },
        Thursday: { name: 'Rest', workouts: [] },
        Friday: { name: 'Full Body C', workouts: getExercisesByNames(['Hack Squat', 'Dumbbell Fly', 'Lat Pulldown', 'Arnold Press', 'Leg Curl']) },
        Saturday: { name: 'Cardio/Core', workouts: getExercisesByNames(['Jump Rope', 'Plank', 'Crunches', 'Leg Raise']) },
        Sunday: { name: 'Rest', workouts: [] }
      };
      break;
  }
  
  saveWeeklySchedule(schedule);
  renderWeeklySchedule();
  toast(`${template.replace('-', ' ').toUpperCase()} template applied!`);
}

// ─── Navigation ─────────────────────────────────────────
function navigate(page) {
    SoundManager.tap();

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
  if (page === 'schedule') renderWeeklySchedule();
  if (page === 'calorie') renderCalorieTracker();
  if (page === 'calculator') { 
  renderCalorieTracker();
  displaySavedProfile();
  loadSavedProfile();
}
}

// ─── Dashboard ───────────────────────────────────────────
function updateGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
  document.getElementById('greeting-title').textContent = g;
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

function sessionCardHTML(s) {
  const exerciseCount = s.exercises?.length || 0;
  const totalSets = s.totalSets || s.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;
  
  return `
    <div class="session-card" onclick="viewSessionDetailsFromDashboard('${s.id}')">
      <div class="session-card-header">
        <span class="session-card-name">${escHtml(s.name || 'Workout Session')}</span>
        <span class="session-card-date">${formatDate(s.date)}</span>
      </div>
      <div class="session-card-detail">${exerciseCount} exercise(s) · ${totalSets} sets</div>
      <div class="session-card-sets">
        ${s.exercises?.slice(0, 4).map(e => `<span class="session-set-tag">${escHtml(e.name)}</span>`).join('')}
        ${exerciseCount > 4 ? `<span class="session-set-tag">+${exerciseCount - 4} more</span>` : ''}
      </div>
    </div>`;
}

// Add this function to view from dashboard by ID
function viewSessionDetailsFromDashboard(sessionId) {
  const { sessions } = getData();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex !== -1) {
    viewSessionDetails(sessionIndex);
  }
}

function getTodayWater(waterLog) {
  const today = new Date().toISOString().split('T')[0];
  return waterLog.filter(l => l.date.startsWith(today)).reduce((a, l) => a + l.amount, 0);
}

function renderDashboard() {
  updateGreeting();
  const { sessions, prs, settings, waterLog, weightLog, weightLossGoal } = getData();

  const streak = calcStreak(sessions);
  document.getElementById('stat-sessions').textContent = sessions.length;
  document.getElementById('stat-prs').textContent = Object.keys(prs).length;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('streak-count').textContent = streak;

  const todayWater = getTodayWater(waterLog);
  const goal = settings.waterGoal || 2000;
  document.getElementById('dash-water-text').textContent = `${todayWater} / ${goal} ml`;
  document.getElementById('dash-water-bar').style.width = Math.min(100, (todayWater / goal) * 100) + '%';

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

  const recentEl = document.getElementById('recent-sessions-list');
  if (sessions.length === 0) {
    recentEl.innerHTML = `<div class="empty-state"><span class="empty-icon">🏋️</span><p>No sessions yet. Start your first workout!</p><button class="btn btn-primary" onclick="navigate('workouts')">Browse Workouts</button></div>`;
  } else {
    recentEl.innerHTML = sessions.slice(-3).reverse().map(s => sessionCardHTML(s)).join('');
  }

  const grid = document.getElementById('quick-muscle-grid');
  grid.innerHTML = MUSCLE_GROUPS.filter(m => m !== 'All').map(m => `
    <div class="muscle-chip" onclick="navigate('workouts'); setMuscleFilter('${m}')">
      <span class="muscle-chip-icon">${MUSCLE_EMOJIS[m] || '💪'}</span>
      <span>${m}</span>
    </div>`).join('');
}

// ─── Workouts ────────────────────────────────────────────
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
        <div class="exercise-card">
          <div class="exercise-info" style="flex:1">
            <div class="exercise-name">${escHtml(e.name)}</div>
            <div class="exercise-meta">${e.isCardio ? 'Cardio' : `${e.sets} sets × ${e.reps} reps · ${e.rest}s rest`}</div>
            ${prs[e.id] ? `<div class="exercise-pr">PR: ${prs[e.id].weight}kg</div>` : ''}
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); addToWorkoutQueue('${e.id}', '${escHtml(e.name)}')" style="padding:6px 12px">+ Queue</button>
            <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); startSessionForExercise('${e.id}')" style="padding:6px 12px">▶ Start</button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function renderCustomWorkouts() {
  const { customWorkouts } = getData();
  const el = document.getElementById('custom-workouts-list');
  if (!customWorkouts.length) { el.innerHTML = '<p class="muted-text">No custom workouts yet.</p>'; return; }
  el.innerHTML = customWorkouts.map(w => `
    <div class="exercise-card">
      <div class="exercise-info" style="flex:1">
        <div class="exercise-name">${escHtml(w.name)}</div>
        <div class="exercise-meta">${w.muscle} · ${w.sets} sets × ${w.reps} reps · ${w.rest}s rest</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); addToWorkoutQueue('${w.id}', '${escHtml(w.name)}')" style="padding:6px 12px">+ Queue</button>
        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); editWorkout('${w.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteWorkout('${w.id}')">🗑</button>
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

// ─── Session Logging ─────────────────────────────────────
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
        <input class="set-input" type="number" inputmode="decimal" pattern="[0-9]*" id="set-weight-${i}" placeholder="${exercise.id === 'push-up' || exercise.id === 'pull-up' ? 'BW' : '0'}" step="0.5" />
        <input class="set-input" type="number" inputmode="numeric" pattern="[0-9]*" id="set-reps-${i}" placeholder="${exercise.reps}" />
        <div class="set-check" id="set-check-${i}" onclick="toggleSetCheck(${i}, ${exercise.rest})"></div>
      </div>`).join('')}
    <div style="margin-top:4px;font-size:12px;color:var(--text3)">Tap ✓ to mark set done · rest timer starts automatically</div>
  `;
}

function renderCardioSessionInputs(exercise) {
  return `
    <div class="form-group" style="margin-top:8px">
      <label class="form-label">Duration (minutes)</label>
      <input class="set-input" type="number" inputmode="numeric" pattern="[0-9]*" id="cardio-session-duration" placeholder="30" style="width:100%" />
    </div>
    <div class="form-group">
      <label class="form-label">Distance (km, optional)</label>
      <input class="set-input" type="number" inputmode="decimal" pattern="[0-9]*" id="cardio-session-distance" placeholder="5" step="0.1" style="width:100%" />
    </div>
    <div class="form-group">
      <label class="form-label">Intensity (1-10, optional)</label>
      <input class="set-input" type="number" inputmode="numeric" pattern="[0-9]*" id="cardio-session-intensity" placeholder="7" min="1" max="10" style="width:100%" />
    </div>
  `;
}

function toggleSetCheck(i, rest) {
  const check = document.getElementById('set-check-' + i);
  const num = document.getElementById('set-num-' + i);
  const isDone = check.classList.toggle('checked');
  num.classList.toggle('done', isDone);
  isDone ? SoundManager.check() : SoundManager.uncheck();
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
  
  if (state.activeSession?.isScheduled && state.scheduledSession) {
    const nextIndex = (state.scheduledCurrentIndex || 0) + 1;
    if (nextIndex < state.scheduledSession.workouts.length) {
      toast(`Next exercise: ${state.scheduledSession.workouts[nextIndex].name}`);
      startScheduledExercise(nextIndex);
    } else {
      toast("🎉 Complete! You finished your scheduled workout!");
      state.scheduledSession = null;
    }
  }
  
  if (state.currentPage === 'progress') renderProgress();
  if (state.currentPage === 'home') renderDashboard();
  if (state.currentPage === 'schedule') renderWeeklySchedule();
}

// ─── Progress ────────────────────────────────────────────
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
  if (!sessions.length) { 
    el.innerHTML = '<p class="muted-text">No sessions logged yet.</p>'; 
    return; 
  }
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].reverse();
  
  el.innerHTML = sortedSessions.map((session, idx) => {
    // Count total exercises in this session
    const exerciseCount = session.exercises?.length || 0;
    const totalSets = session.totalSets || session.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;
    
    return `
      <div class="session-card" onclick="viewSessionDetails(${sessions.length - 1 - idx})">
        <div class="session-card-header">
          <span class="session-card-name">${escHtml(session.name || 'Workout Session')}</span>
          <span class="session-card-date">${formatDate(session.date)}</span>
        </div>
        <div class="session-card-detail">${exerciseCount} exercise(s) · ${totalSets} sets</div>
        <div class="session-card-sets">
          ${session.exercises?.slice(0, 4).map(e => `<span class="session-set-tag">${escHtml(e.name)}</span>`).join('')}
          ${exerciseCount > 4 ? `<span class="session-set-tag">+${exerciseCount - 4} more</span>` : ''}
        </div>
        <button class="btn btn-sm btn-ghost" style="margin-top:8px;width:100%" onclick="event.stopPropagation(); viewSessionDetails(${sessions.length - 1 - idx})">
          📋 View Full Session
        </button>
      </div>
    `;
  }).join('');
}

// ─── Goals ───────────────────────────────────────────────
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

  // Fix: Water fill should be height from bottom
  const waterFill = document.getElementById('water-fill');
  if (waterFill) {
    waterFill.style.height = pct + '%';
  }
  
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

function addWater(ml) {
  const log = getData().waterLog;
  log.push({ amount: ml, date: new Date().toISOString() });
  DB.set('waterLog', log);
  SoundManager.waterSplash();
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

// ─── Initialize ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateGreeting();
  renderDashboard();
  renderWorkouts();
  renderCalorieTracker();
  displaySavedProfile();
  loadSavedProfile();
  loadWorkoutQueue(); // Add this line

  
  const deleteBtn = document.getElementById('delete-schedule-workout-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => deleteScheduledWorkout();
  }
  
  const goalDisplay = document.querySelector('.calorie-goal-display');
  if (goalDisplay) {
    goalDisplay.onclick = () => openCalorieGoalModal();
  }
  
});
// ─── Calorie Calculator Functions ─────────────────────────

let selectedSex = 'male';

function selectSex(sex) {
  selectedSex = sex;
  document.querySelectorAll('.sex-btn').forEach(btn => {
    if (btn.dataset.sex === sex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function calculateCalories() {
  // Get values
  const age = parseInt(document.getElementById('calc-age').value);
  const weight = parseFloat(document.getElementById('calc-weight').value);
  const height = parseFloat(document.getElementById('calc-height').value);
  const activity = parseFloat(document.getElementById('calc-activity').value);
  const goal = document.getElementById('calc-goal').value;
  
  // Validation
  if (!age || !weight || !height) {
    toast('Please fill in all fields');
    return;
  }
  
  if (age < 15 || age > 120) {
    toast('Please enter a valid age (15-120)');
    return;
  }
  
  if (weight < 30 || weight > 300) {
    toast('Please enter a valid weight (30-300 kg)');
    return;
  }
  
  if (height < 100 || height > 250) {
    toast('Please enter a valid height (100-250 cm)');
    return;
  }
  
  // Calculate BMR using Mifflin-St Jeor Formula
  let bmr;
  if (selectedSex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Calculate maintenance calories
  const maintenance = Math.round(bmr * activity);
  
  // Calculate goal calories
  let goalCalories = maintenance;
  let goalText = '';
  
  switch(goal) {
    case 'maintain':
      goalCalories = maintenance;
      goalText = 'Maintain weight';
      break;
    case 'lose':
      goalCalories = maintenance - 500;
      goalText = 'Lose weight (0.5kg/week)';
      break;
    case 'lose-aggressive':
      goalCalories = maintenance - 1000;
      goalText = 'Lose weight fast (1kg/week)';
      break;
    case 'gain':
      goalCalories = maintenance + 300;
      goalText = 'Gain weight (slow bulk)';
      break;
    case 'gain-aggressive':
      goalCalories = maintenance + 500;
      goalText = 'Gain muscle (lean bulk)';
      break;
  }
  
  // Ensure minimum calories
  if (goalCalories < 1200) {
    goalCalories = 1200;
    toast('Minimum recommended calories is 1200 per day');
  }
  
  // Calculate BMI
  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';
  
  // Calculate macros
  const proteinG = Math.round(weight * 1.8);
  const fatG = Math.round(goalCalories * 0.25 / 9);
  const carbsG = Math.round((goalCalories - (proteinG * 4) - (fatG * 9)) / 4);
  
  // Display results
  document.getElementById('result-bmr').textContent = Math.round(bmr);
  document.getElementById('result-maintenance').textContent = maintenance;
  document.getElementById('result-goal').textContent = goalCalories;
  
  document.getElementById('bmi-display').innerHTML = `
    <span class="bmi-value">BMI: ${bmi}</span>
    <span class="bmi-category">(${bmiCategory})</span>
  `;
  
  document.getElementById('macro-recommendation').innerHTML = `
    <div class="macro-row"><span class="macro-name">💪 Protein</span><span class="macro-value">${proteinG}g (${Math.round(proteinG * 4)} kcal)</span></div>
    <div class="macro-row"><span class="macro-name">🍚 Carbs</span><span class="macro-value">${carbsG}g (${Math.round(carbsG * 4)} kcal)</span></div>
    <div class="macro-row"><span class="macro-name">🧈 Fats</span><span class="macro-value">${fatG}g (${Math.round(fatG * 9)} kcal)</span></div>
    <div class="macro-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--card-border);">
      <span class="macro-name">🎯 Goal</span>
      <span class="macro-value">${goalText}</span>
    </div>
  `;
  
  // Store calculation results
  state.lastCalculation = {
    calories: goalCalories,
    protein: proteinG,
    carbs: carbsG,
    fats: fatG,
    bmr: Math.round(bmr),
    maintenance: maintenance
  };
  
  // Show results
  document.getElementById('calculator-results').style.display = 'block';
  
  // Scroll to results
  document.getElementById('calculator-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  toast('Calculation complete!');
}

function saveCalculatorProfile() {
  const age = document.getElementById('calc-age').value;
  const weight = document.getElementById('calc-weight').value;
  const height = document.getElementById('calc-height').value;
  const activity = document.getElementById('calc-activity').options[document.getElementById('calc-activity').selectedIndex].text;
  const goal = document.getElementById('calc-goal').options[document.getElementById('calc-goal').selectedIndex].text;
  
  if (!age || !weight || !height) {
    toast('Please calculate your calories first');
    return;
  }
  
  const profile = {
    age: parseInt(age),
    weight: parseFloat(weight),
    height: parseFloat(height),
    sex: selectedSex,
    activity: activity,
    goal: goal,
    savedAt: new Date().toISOString()
  };
  
  DB.set('calculatorProfile', profile);
  
  if (state.lastCalculation) {
    DB.set('lastCalculation', state.lastCalculation);
  }
  
  displaySavedProfile();
  toast('Profile saved!');
}

function displaySavedProfile() {
  const profile = DB.get('calculatorProfile', null);
  const lastCalc = DB.get('lastCalculation', null);
  
  if (profile) {
    document.getElementById('saved-profile').style.display = 'block';
    document.getElementById('saved-profile-info').innerHTML = `
      <div>👤 ${profile.sex === 'male' ? 'Male' : 'Female'}, ${profile.age} years</div>
      <div>⚖️ ${profile.weight} kg · 📏 ${profile.height} cm</div>
      <div>🏃 ${profile.activity}</div>
      <div>🎯 ${profile.goal}</div>
      ${lastCalc ? `<div style="margin-top:8px;color:var(--accent)">🔥 ${lastCalc.calories} kcal/day</div>` : ''}
    `;
  } else {
    document.getElementById('saved-profile').style.display = 'none';
  }
}

function clearSavedProfile() {
  if (confirm('Clear your saved profile?')) {
    DB.set('calculatorProfile', null);
    DB.set('lastCalculation', null);
    displaySavedProfile();
    toast('Profile cleared');
  }
}

function loadSavedProfile() {
  const profile = DB.get('calculatorProfile', null);
  if (profile) {
    document.getElementById('calc-age').value = profile.age;
    document.getElementById('calc-weight').value = profile.weight;
    document.getElementById('calc-height').value = profile.height;
    selectSex(profile.sex);
    
    const activitySelect = document.getElementById('calc-activity');
    for (let i = 0; i < activitySelect.options.length; i++) {
      if (activitySelect.options[i].text === profile.activity) {
        activitySelect.selectedIndex = i;
        break;
      }
    }
    
    const goalSelect = document.getElementById('calc-goal');
    for (let i = 0; i < goalSelect.options.length; i++) {
      if (goalSelect.options[i].text === profile.goal) {
        goalSelect.selectedIndex = i;
        break;
      }
    }
    
    toast('Profile loaded!');
  } else {
    toast('No saved profile found');
  }
}

function applyToCalorieTracker() {
  if (!state.lastCalculation) {
    toast('Please calculate your calories first');
    return;
  }
  
  const goals = {
    calories: state.lastCalculation.calories,
    protein: state.lastCalculation.protein,
    carbs: state.lastCalculation.carbs,
    fats: state.lastCalculation.fats
  };
  
  DB.set('calorieGoals', goals);
  renderCalorieTracker();
  toast(`Calorie goal set to ${goals.calories} kcal!`);
  
  // Navigate to calorie tracker
  navigate('calorie');
}

// Force numeric keyboard on mobile devices
function setupNumericInputs() {
  // Select all number inputs without inputmode
  document.querySelectorAll('input[type="number"]').forEach(input => {
    if (!input.hasAttribute('inputmode')) {
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');
    }
  });
}

// ─── Workout Queue System ───────────────────────────────────

let workoutQueue = [];

// Load queue from localStorage
function loadWorkoutQueue() {
  const saved = DB.get('workoutQueue', []);
  workoutQueue = saved;
  renderWorkoutQueue();
}

// Save queue to localStorage
function saveWorkoutQueue() {
  DB.set('workoutQueue', workoutQueue);
  renderWorkoutQueue();
}

// Add exercise to queue
function addToWorkoutQueue(exerciseId, exerciseName) {
  // Find the exercise data
  const allExercises = [...EXERCISE_LIBRARY, ...(getData().customWorkouts || [])];
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;
  
  // Check if already in queue
  if (workoutQueue.some(item => item.id === exerciseId)) {
    toast(`${exercise.name} is already in your queue`);
    return;
  }
  
  // Add to queue
  workoutQueue.push({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets || 3,
    reps: exercise.reps || 10,
    rest: exercise.rest || 60,
    isCardio: exercise.isCardio || false,
    muscle: exercise.muscle || 'General',
    completed: false,
    loggedSets: [],
    maxWeight: 0
  });
  
  saveWorkoutQueue();
  toast(`➕ Added ${exercise.name} to queue`);
  
  if (typeof SoundManager !== 'undefined') SoundManager.playAdd();
}

// Remove exercise from queue
function removeFromQueue(index) {
  const removed = workoutQueue[index];
  workoutQueue.splice(index, 1);
  saveWorkoutQueue();
  toast(`Removed ${removed.name} from queue`);
  if (typeof SoundManager !== 'undefined') SoundManager.playDelete();
}

// Clear entire queue
function clearWorkoutQueue() {
  if (confirm('Clear your entire workout queue?')) {
    workoutQueue = [];
    saveWorkoutQueue();
    toast('Queue cleared');
  }
}

// Render queue list
function renderWorkoutQueue() {
  const container = document.getElementById('workout-queue-list');
  const countEl = document.getElementById('queue-count');
  const actionsEl = document.getElementById('queue-actions');
  
  if (!container) return;
  
  const incompleteCount = workoutQueue.filter(item => !item.completed).length;
  const totalCount = workoutQueue.length;
  
  if (countEl) countEl.textContent = `${incompleteCount}/${totalCount}`;
  
  if (workoutQueue.length === 0) {
    container.innerHTML = '<div class="queue-empty">No exercises added. Tap + on any exercise to add to queue.</div>';
    if (actionsEl) actionsEl.style.display = 'none';
    return;
  }
  
  if (actionsEl) actionsEl.style.display = 'flex';
  
  container.innerHTML = workoutQueue.map((item, idx) => {
    // Calculate how many sets have data
    const hasData = item.loggedSets && item.loggedSets.length > 0;
    const completedSets = item.loggedSets?.filter(s => s.done).length || 0;
    const totalSets = item.sets || 3;
    
    return `
      <div class="workout-queue-item ${item.completed ? 'completed' : ''}">
        <div class="workout-queue-item-info" style="flex:1">
          <div class="workout-queue-item-name">
            <span class="workout-queue-status ${item.completed ? 'completed' : ''}">
              ${item.completed ? '✅' : (hasData ? '📝' : '⭕')}
            </span>
            ${escHtml(item.name)}
          </div>
          <div class="workout-queue-item-detail">
            ${item.isCardio ? 'Cardio' : `${item.sets} sets × ${item.reps} reps · ${item.rest}s rest`}
            ${hasData ? ` · Logged: ${completedSets}/${totalSets} sets` : ''}
            ${item.completed && item.maxWeight > 0 ? ` · Max: ${item.maxWeight}kg` : ''}
          </div>
        </div>
        <div style="display:flex; gap: 6px;">
          <button class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="event.stopPropagation(); openQueueExerciseModal(${idx})">
            ${hasData ? '✏️ Edit' : '📝 Log'}
          </button>
          <button class="workout-queue-remove" onclick="event.stopPropagation(); removeFromQueue(${idx})" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

// Open modal to log sets for a queued exercise
function openQueueExerciseModal(queueIndex) {
  const exercise = workoutQueue[queueIndex];
  if (!exercise) return;
  
  state.activeQueueIndex = queueIndex;
  state.activeSession = { 
    exercise: exercise, 
    sets: exercise.loggedSets || [],
    isQueued: true 
  };
  
  document.getElementById('session-modal-title').textContent = `Log: ${exercise.name}`;
  const body = document.getElementById('session-modal-body');
  const sets = exercise.sets || 3;
  const isCardio = exercise.isCardio;
  
  // Pre-fill existing logged sets
  let setsHtml = '';
  if (!isCardio) {
    setsHtml = `
      <div class="set-labels">
        <span>Set</span><span>Weight (kg)</span><span>Reps</span><span>✓</span>
      </div>
      ${Array.from({length: sets}, (_, i) => {
        const existingSet = exercise.loggedSets && exercise.loggedSets[i];
        const isDone = existingSet?.done || false;
        // Load saved values - THIS IS KEY
        const weightValue = (existingSet?.weight !== undefined && existingSet?.weight !== null) ? existingSet.weight : '';
        const repsValue = (existingSet?.reps !== undefined && existingSet?.reps !== null) ? existingSet.reps : '';
        return `
          <div class="set-row" id="set-row-${i}">
            <div class="set-num ${isDone ? 'done' : ''}" id="set-num-${i}">${i+1}</div>
            <input class="set-input" type="number" inputmode="decimal" id="set-weight-${i}" value="${weightValue}" placeholder="0" step="0.5" />
            <input class="set-input" type="number" inputmode="numeric" id="set-reps-${i}" value="${repsValue}" placeholder="${exercise.reps || 10}" />
            <div class="set-check ${isDone ? 'checked' : ''}" id="set-check-${i}" onclick="toggleQueuedSetCheck(${i})"></div>
          </div>`;
      }).join('')}
      <div style="margin-top:8px; font-size:12px; color:var(--text3); text-align:center;">
        💡 Enter weight & reps, tap ✓ to mark set done. Press "Save Exercise" to save.
      </div>
    `;
  } else {
    const existingSet = exercise.loggedSets && exercise.loggedSets[0];
    setsHtml = `
      <div class="form-group" style="margin-top:8px">
        <label class="form-label">Duration (minutes)</label>
        <input class="set-input" type="number" inputmode="numeric" id="cardio-session-duration" value="${existingSet?.duration || ''}" placeholder="30" style="width:100%" />
      </div>
      <div class="form-group">
        <label class="form-label">Distance (km, optional)</label>
        <input class="set-input" type="number" inputmode="decimal" id="cardio-session-distance" value="${existingSet?.distance || ''}" placeholder="5" step="0.1" style="width:100%" />
      </div>
      <div class="form-group">
        <label class="form-label">Intensity (1-10, optional)</label>
        <input class="set-input" type="number" inputmode="numeric" id="cardio-session-intensity" value="${existingSet?.intensity || ''}" placeholder="7" min="1" max="10" style="width:100%" />
      </div>
    `;
  }
  
  body.innerHTML = `
    <div class="session-exercise-title">${escHtml(exercise.name)}</div>
    ${setsHtml}
    <div class="rest-timer" id="rest-timer-box">
      <div class="timer-display" id="timer-display">0:00</div>
      <div class="timer-label">REST · tap to skip</div>
      <button class="btn btn-sm btn-ghost" style="margin-top:8px" onclick="skipTimer()">Skip</button>
    </div>
  `;
  
  openModal('session-modal');
}

// Toggle set check for queued exercise
function toggleQueuedSetCheck(setIndex) {
  const check = document.getElementById('set-check-' + setIndex);
  const num = document.getElementById('set-num-' + setIndex);
  const isDone = check.classList.toggle('checked');
  num.classList.toggle('done', isDone);
  
  if (isDone && typeof SoundManager !== 'undefined') SoundManager.playSetComplete();
}

// Save current exercise's logged sets to queue
function saveQueuedExercise() {
  const queueIndex = state.activeQueueIndex;
  const exercise = workoutQueue[queueIndex];
  if (!exercise) return;
  
  const isCardio = exercise.isCardio;
  
  if (isCardio) {
    const duration = parseInt(document.getElementById('cardio-session-duration')?.value) || 0;
    const distance = parseFloat(document.getElementById('cardio-session-distance')?.value) || null;
    const intensity = parseInt(document.getElementById('cardio-session-intensity')?.value) || null;
    
    if (!duration) { 
      toast('Please enter a duration'); 
      return; 
    }
    
    exercise.loggedSets = [{ duration, distance, intensity, done: true }];
    exercise.completed = true;
    exercise.maxWeight = 0;
    saveWorkoutQueue();
    toast(`✅ Saved ${exercise.name}: ${duration} minutes`);
    
  } else {
    const sets = exercise.sets || 3;
    const loggedSets = [];
    let maxWeight = 0;
    let allCompleted = true;
    
    // Get ALL values from inputs (even if not marked done)
    for (let i = 0; i < sets; i++) {
      const weightInput = document.getElementById('set-weight-' + i);
      const repsInput = document.getElementById('set-reps-' + i);
      const checkBox = document.getElementById('set-check-' + i);
      
      let w = 0;
      let r = 0;
      let done = false;
      
      if (weightInput) w = parseFloat(weightInput.value) || 0;
      if (repsInput) r = parseInt(repsInput.value) || 0;
      if (checkBox) done = checkBox.classList.contains('checked');
      
      loggedSets.push({ weight: w, reps: r, done: done });
      if (w > maxWeight) maxWeight = w;
      if (!done) allCompleted = false;
    }
    
    // Save ALL entered data (including empty ones)
    exercise.loggedSets = loggedSets;
    exercise.maxWeight = maxWeight;
    exercise.completed = allCompleted;
    
    // Save to localStorage
    saveWorkoutQueue();
    
    const completedCount = loggedSets.filter(s => s.done).length;
    const weightDisplay = maxWeight > 0 ? `${maxWeight}kg` : 'Bodyweight';
    toast(`✅ Saved ${exercise.name}: ${completedCount}/${sets} sets, max ${weightDisplay}`);
    
    // Update PR
    if (maxWeight > 0) {
      const prs = getData().prs;
      if (!prs[exercise.id] || maxWeight > prs[exercise.id].weight) {
        prs[exercise.id] = { weight: maxWeight, date: new Date().toISOString(), name: exercise.name };
        DB.set('prs', prs);
        setTimeout(() => toast('🏆 New PR! ' + maxWeight + 'kg'), 1000);
        if (typeof SoundManager !== 'undefined') SoundManager.playSuccess();
      }
    }
  }
  
  closeModal('session-modal');
  if (typeof SoundManager !== 'undefined') SoundManager.playAdd();
}


// Save entire session to history
function saveFullSession() {
  const completedExercises = workoutQueue.filter(item => item.completed);
  const incompleteExercises = workoutQueue.filter(item => !item.completed);
  
  if (completedExercises.length === 0) {
    toast('Complete at least one exercise before saving');
    return;
  }
  
  if (incompleteExercises.length > 0) {
    if (!confirm(`${incompleteExercises.length} exercise(s) not completed. Save only completed ones?`)) return;
  }
  
  // Calculate total sets
  const totalSets = completedExercises.reduce((sum, ex) => {
    return sum + (ex.loggedSets?.filter(set => set.done).length || 0);
  }, 0);
  
  // Create ONE session with ALL completed exercises
  const sessionData = {
    id: 'sess_' + Date.now(),
    date: new Date().toISOString(),
    name: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} Workout`,
    type: 'full_session',
    exercises: completedExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      isCardio: ex.isCardio || false,
      sets: ex.loggedSets || [],
      maxWeight: ex.maxWeight || 0
    })),
    totalExercises: completedExercises.length,
    totalSets: totalSets
  };
  
  // Save to sessions
  const sessions = getData().sessions;
  sessions.push(sessionData);
  DB.set('sessions', sessions);
  
  // Also log cardio separately
  completedExercises.filter(ex => ex.isCardio).forEach(ex => {
    const cardioLog = getData().cardioLog;
    const set = ex.loggedSets?.[0] || {};
    cardioLog.push({
      type: ex.name,
      duration: set?.duration || 0,
      distance: set?.distance || null,
      calories: null,
      date: new Date().toISOString()
    });
    DB.set('cardioLog', cardioLog);
  });
  
  // Update PRs for all exercises
  completedExercises.forEach(ex => {
    if (ex.maxWeight > 0 && !ex.isCardio) {
      const prs = getData().prs;
      if (!prs[ex.id] || ex.maxWeight > prs[ex.id].weight) {
        prs[ex.id] = { weight: ex.maxWeight, date: new Date().toISOString(), name: ex.name };
        DB.set('prs', prs);
      }
    }
  });
  
  // Clear completed exercises from queue
  workoutQueue = workoutQueue.filter(item => !item.completed);
  saveWorkoutQueue();
  
  if (typeof SoundManager !== 'undefined') SoundManager.playWorkoutComplete();
  toast(`🎉 Session saved! ${completedExercises.length} exercises, ${totalSets} sets completed`);
  
  // Refresh UI
  if (state.currentPage === 'progress') renderProgress();
  if (state.currentPage === 'home') renderDashboard();
}

// Quick toggle exercise completion (for testing)
// Quick toggle exercise completion (for testing)
// Quick toggle exercise completion (for testing)
function quickCompleteExercise(index) {
  const exercise = workoutQueue[index];
  if (!exercise) return;
  
  if (!exercise.completed) {
    // Auto-fill with realistic default values based on exercise
    const sets = exercise.sets || 3;
    const loggedSets = [];
    let defaultWeight = 0;
    let defaultReps = exercise.reps || 10;
    
    // Set different default weights based on exercise name
    const exerciseName = exercise.name.toLowerCase();
    
    if (exerciseName.includes('pull') || exerciseName.includes('chin')) {
      defaultWeight = 0; // Bodyweight
      defaultReps = 8;
    } else if (exerciseName.includes('push-up')) {
      defaultWeight = 0; // Bodyweight
      defaultReps = 20;
    } else if (exerciseName.includes('squat')) {
      defaultWeight = 100;
    } else if (exerciseName.includes('deadlift')) {
      defaultWeight = 140;
    } else if (exerciseName.includes('bench')) {
      defaultWeight = 80;
    } else if (exerciseName.includes('press') && exerciseName.includes('overhead')) {
      defaultWeight = 50;
    } else if (exerciseName.includes('curl')) {
      defaultWeight = 30;
    } else if (exerciseName.includes('tricep')) {
      defaultWeight = 30;
    } else if (exerciseName.includes('row')) {
      defaultWeight = 60;
    } else if (exerciseName.includes('leg press')) {
      defaultWeight = 150;
    } else if (exerciseName.includes('lat pulldown')) {
      defaultWeight = 60;
    } else {
      defaultWeight = 40;
    }
    
    for (let i = 0; i < sets; i++) {
      loggedSets.push({ 
        weight: defaultWeight, 
        reps: defaultReps, 
        done: true 
      });
    }
    
    exercise.loggedSets = loggedSets;
    exercise.maxWeight = defaultWeight;
    exercise.completed = true;
    saveWorkoutQueue();
    
    const weightDisplay = defaultWeight === 0 ? 'Bodyweight' : `${defaultWeight}kg`;
    toast(`✅ Marked ${exercise.name} as completed (${weightDisplay} × ${defaultReps} reps)`);
  } else {
    exercise.completed = false;
    exercise.loggedSets = [];
    exercise.maxWeight = 0;
    saveWorkoutQueue();
    toast(`⭕ Unmarked ${exercise.name}`);
  }
}

// View full session details modal
// View full session details modal
function viewSessionDetails(sessionIndex) {
  const { sessions } = getData();
  const session = sessions[sessionIndex];
  if (!session) return;
  
  const modalBody = document.getElementById('session-modal-body');
  const modalTitle = document.getElementById('session-modal-title');
  
  modalTitle.textContent = `${formatDate(session.date)} - Workout Details`;
  
  // Calculate totals
  let totalSets = 0;
  let totalWeight = 0;
  
  session.exercises?.forEach(ex => {
    if (!ex.isCardio && ex.sets) {
      ex.sets.forEach(set => {
        if (set.done) {
          totalSets++;
          totalWeight += (set.weight || 0);
        }
      });
    } else if (ex.isCardio) {
      totalSets++;
    }
  });
  
  // Build exercises list
  let exercisesHtml = `
    <div class="session-summary">
      <div class="session-summary-item">
        <span class="session-summary-label">📅 Date & Time</span>
        <span class="session-summary-value">${new Date(session.date).toLocaleString()}</span>
      </div>
      <div class="session-summary-item">
        <span class="session-summary-label">💪 Exercises</span>
        <span class="session-summary-value">${session.exercises?.length || 0}</span>
      </div>
      <div class="session-summary-item">
        <span class="session-summary-label">🔢 Total Sets</span>
        <span class="session-summary-value">${session.totalSets || totalSets}</span>
      </div>
      ${totalWeight > 0 ? `<div class="session-summary-item">
        <span class="session-summary-label">🏋️ Total Volume</span>
        <span class="session-summary-value">${totalWeight} kg</span>
      </div>` : ''}
    </div>
  `;
  
  // Add each exercise with its sets
  session.exercises?.forEach((exercise, exIdx) => {
    const isCardio = exercise.isCardio;
    const maxWeight = exercise.maxWeight || 0;
    const completedSets = exercise.sets?.filter(s => s.done).length || 0;
    const totalExerciseSets = exercise.sets?.length || 0;
    
    exercisesHtml += `
      <div class="exercise-group" style="margin-top: 20px;">
        <div class="exercise-group-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>${isCardio ? '🏃' : '💪'} ${escHtml(exercise.name)}</span>
          <span style="font-size: 11px; color: var(--accent);">${completedSets}/${totalExerciseSets} sets done</span>
        </div>
        <div style="background: var(--bg3); border-radius: var(--radius-sm); padding: 8px;">
    `;
    
    if (isCardio) {
      const set = exercise.sets?.[0] || {};
      exercisesHtml += `
        <div style="padding: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>⏱ Duration</span>
            <span style="font-weight: 700; color: var(--accent);">${set.duration || 0} minutes</span>
          </div>
          ${set.distance ? `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>📏 Distance</span>
            <span style="font-weight: 700;">${set.distance} km</span>
          </div>` : ''}
          ${set.intensity ? `<div style="display: flex; justify-content: space-between;">
            <span>⚡ Intensity</span>
            <span style="font-weight: 700;">${set.intensity}/10</span>
          </div>` : ''}
        </div>
      `;
    } else {
      if (exercise.sets && exercise.sets.length > 0) {
        exercisesHtml += `
          <div class="set-labels" style="padding: 0 8px; margin-bottom: 8px; display: grid; grid-template-columns: 40px 1fr 1fr 40px; gap: 8px;">
            <span>Set</span><span>Weight (kg)</span><span>Reps</span><span>✓</span>
          </div>
        `;
        
        exercise.sets.forEach((set, setIdx) => {
          const isDone = set.done;
          exercisesHtml += `
            <div class="set-row" style="opacity: ${isDone ? 1 : 0.5}; padding: 4px 8px;">
              <div class="set-num ${isDone ? 'done' : ''}" style="width: 32px; height: 32px; font-size: 12px;">${setIdx + 1}</div>
              <div style="text-align: center; font-weight: 600;">${set.weight || 0}</div>
              <div style="text-align: center; font-weight: 600;">${set.reps || 0}</div>
              <div class="set-check ${isDone ? 'checked' : ''}" style="pointer-events: none; width: 24px; height: 24px;"></div>
            </div>
          `;
        });
        
        if (maxWeight > 0) {
          exercisesHtml += `
            <div style="margin-top: 12px; padding: 10px; text-align: center; background: var(--accent-dim); border-radius: var(--radius-sm);">
              🏆 Max Weight: <strong style="color: var(--accent); font-size: 16px;">${maxWeight} kg</strong>
            </div>
          `;
        }
      } else {
        exercisesHtml += `
          <div style="padding: 20px; text-align: center; color: var(--text3);">
            No sets recorded for this exercise
          </div>
        `;
      }
    }
    
    exercisesHtml += `</div></div>`;
  });
  
  modalBody.innerHTML = exercisesHtml;
  openModal('session-modal');
}

// Quick log with prompt (⚡ button)
function quickLogExercise(index) {
  const exercise = workoutQueue[index];
  if (!exercise) return;
  
  const isCardio = exercise.isCardio;
  
  if (isCardio) {
    const duration = prompt(`Enter duration for ${exercise.name} (minutes):`, "30");
    if (duration === null) return;
    
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast('Please enter a valid duration');
      return;
    }
    
    exercise.loggedSets = [{ duration: durationNum, distance: null, intensity: null, done: true }];
    exercise.completed = true;
    exercise.maxWeight = 0;
    saveWorkoutQueue();
    toast(`✅ Completed ${exercise.name}: ${durationNum} minutes`);
    
  } else {
    const weight = prompt(`Enter weight for ${exercise.name} (kg):`, "60");
    if (weight === null) return;
    
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum)) {
      toast('Please enter a valid weight');
      return;
    }
    
    const reps = prompt(`Enter reps for ${exercise.name}:`, exercise.reps || "10");
    if (reps === null) return;
    
    const repsNum = parseInt(reps);
    if (isNaN(repsNum)) {
      toast('Please enter valid reps');
      return;
    }
    
    const sets = exercise.sets || 3;
    const loggedSets = [];
    for (let i = 0; i < sets; i++) {
      loggedSets.push({ weight: weightNum, reps: repsNum, done: true });
    }
    
    exercise.loggedSets = loggedSets;
    exercise.maxWeight = weightNum;
    exercise.completed = true;
    saveWorkoutQueue();
    
    const weightDisplay = weightNum === 0 ? 'Bodyweight' : `${weightNum}kg`;
    toast(`✅ Completed ${exercise.name}: ${weightDisplay} × ${repsNum} reps`);
    
    // Update PR
    if (weightNum > 0) {
      const prs = getData().prs;
      if (!prs[exercise.id] || weightNum > prs[exercise.id].weight) {
        prs[exercise.id] = { weight: weightNum, date: new Date().toISOString(), name: exercise.name };
        DB.set('prs', prs);
        setTimeout(() => toast('🏆 New PR! ' + weightNum + 'kg'), 1000);
      }
    }
  }
  
  if (typeof SoundManager !== 'undefined') SoundManager.playAdd();
}

// Call this after any dynamic content is loaded
// Add to your render functions where new inputs are created

// Update navigate function to include calculator
// Add to the navigate function:
// if (page === 'calculator') { 
//   renderCalorieTracker();
//   displaySavedProfile();
//   loadSavedProfile();
// }