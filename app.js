// ========================================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ========================================

const APP_STATE = {
    exercises: [],
    todayProgress: {},
    calories: {
        today: 0,
        history: []
    },
    currentScreen: 'workout',
    editingExerciseId: null
};

// ========================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadDataFromStorage();
    setupEventListeners();
    updateCurrentDate();
    renderExerciseList();
    renderExecuteList();
    renderCalories();
    
    // Плавное появление при загрузке
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    });
}

// ========================================
// ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ
// ========================================

function loadDataFromStorage() {
    try {
        const savedExercises = localStorage.getItem('fitness_exercises');
        const savedProgress = localStorage.getItem('fitness_progress');
        const savedCalories = localStorage.getItem('fitness_calories');
        
        if (savedExercises) {
            APP_STATE.exercises = JSON.parse(savedExercises);
        }
        
        if (savedProgress) {
            APP_STATE.todayProgress = JSON.parse(savedProgress);
            // Сброс прогресса если новый день
            const savedDate = localStorage.getItem('fitness_progress_date');
            const today = new Date().toDateString();
            if (savedDate !== today) {
                APP_STATE.todayProgress = {};
                localStorage.setItem('fitness_progress_date', today);
            }
        }
        
        if (savedCalories) {
            APP_STATE.calories = JSON.parse(savedCalories);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

function saveDataToStorage() {
    try {
        localStorage.setItem('fitness_exercises', JSON.stringify(APP_STATE.exercises));
        localStorage.setItem('fitness_progress', JSON.stringify(APP_STATE.todayProgress));
        localStorage.setItem('fitness_calories', JSON.stringify(APP_STATE.calories));
        localStorage.setItem('fitness_progress_date', new Date().toDateString());
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
    }
}

// ========================================
// НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ
// ========================================

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            switchScreen(screen);
        });
    });
    
    // Кнопка добавления упражнения
    document.getElementById('add-exercise-btn').addEventListener('click', () => {
        openExerciseModal();
    });
    
    // Модальное окно
    document.getElementById('close-modal-btn').addEventListener('click', closeExerciseModal);
    document.getElementById('cancel-btn').addEventListener('click', closeExerciseModal);
    
    // Закрытие модального окна при клике вне его
    document.getElementById('exercise-modal').addEventListener('click', (e) => {
        if (e.target.id === 'exercise-modal') {
            closeExerciseModal();
        }
    });
    
    // Форма упражнения
    document.getElementById('exercise-form').addEventListener('submit', handleExerciseSubmit);
    
    // Калории
    document.getElementById('save-calories-btn').addEventListener('click', handleCaloriesSave);
    document.getElementById('calorie-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCaloriesSave();
        }
    });
}

function switchScreen(screenName) {
    // Обновление активной кнопки
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.nav-btn[data-screen="${screenName}"]`).classList.add('active');
    
    // Переключение экранов с анимацией
    const currentScreen = document.querySelector('.screen.active');
    const newScreen = document.getElementById(`${screenName}-screen`);
    
    if (currentScreen !== newScreen) {
        currentScreen.style.transform = 'translateX(-100%)';
        currentScreen.classList.remove('active');
        
        setTimeout(() => {
            currentScreen.style.transform = '';
            newScreen.style.transform = 'translateX(100%)';
            newScreen.classList.add('active');
            
            requestAnimationFrame(() => {
                newScreen.style.transform = 'translateX(0)';
            });
        }, 100);
    }
    
    APP_STATE.currentScreen = screenName;
    
    // Обновление данных при переключении
    if (screenName === 'execute') {
        renderExecuteList();
    } else if (screenName === 'calories') {
        renderCalories();
    }
}

function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('ru-RU', options);
    dateElement.textContent = today;
}

// ========================================
// КОНСТРУКТОР ТРЕНИРОВОК
// ========================================

function renderExerciseList() {
    const listContainer = document.getElementById('exercise-list');
    const emptyState = document.getElementById('empty-workout');
    
    if (APP_STATE.exercises.length === 0) {
        listContainer.innerHTML = '';
        emptyState.classList.add('visible');
        return;
    }
    
    emptyState.classList.remove('visible');
    listContainer.innerHTML = '';
    
    APP_STATE.exercises.forEach((exercise, index) => {
        const card = createExerciseCard(exercise, index);
        listContainer.appendChild(card);
    });
}

function createExerciseCard(exercise, index) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-name">${escapeHtml(exercise.name)}</div>
            <div class="exercise-actions">
                <button class="icon-btn edit" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="icon-btn delete" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="exercise-details">
            <div class="detail-item">
                <div class="detail-label">Подходы</div>
                <div class="detail-value">${exercise.sets}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Повторения</div>
                <div class="detail-value">${exercise.reps}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Вес (кг)</div>
                <div class="detail-value">${exercise.weight}</div>
            </div>
        </div>
    `;
    
    // События для кнопок
    card.querySelector('.edit').addEventListener('click', () => editExercise(index));
    card.querySelector('.delete').addEventListener('click', () => deleteExercise(index));
    
    return card;
}

function openExerciseModal(exerciseIndex = null) {
    const modal = document.getElementById('exercise-modal');
    const form = document.getElementById('exercise-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    APP_STATE.editingExerciseId = exerciseIndex;
    
    if (exerciseIndex !== null) {
        const exercise = APP_STATE.exercises[exerciseIndex];
        title.textContent = 'Редактировать упражнение';
        document.getElementById('exercise-name').value = exercise.name;
        document.getElementById('exercise-sets').value = exercise.sets;
        document.getElementById('exercise-reps').value = exercise.reps;
        document.getElementById('exercise-weight').value = exercise.weight;
    } else {
        title.textContent = 'Добавить упражнение';
    }
    
    modal.classList.add('active');
    
    // Фокус на первое поле с небольшой задержкой
    setTimeout(() => {
        document.getElementById('exercise-name').focus();
    }, 300);
}

function closeExerciseModal() {
    const modal = document.getElementById('exercise-modal');
    modal.classList.remove('active');
    APP_STATE.editingExerciseId = null;
}

function handleExerciseSubmit(e) {
    e.preventDefault();
    
    const exercise = {
        name: document.getElementById('exercise-name').value.trim(),
        sets: parseInt(document.getElementById('exercise-sets').value),
        reps: parseInt(document.getElementById('exercise-reps').value),
        weight: parseFloat(document.getElementById('exercise-weight').value),
        id: Date.now()
    };
    
    if (APP_STATE.editingExerciseId !== null) {
        // Редактирование существующего
        APP_STATE.exercises[APP_STATE.editingExerciseId] = {
            ...APP_STATE.exercises[APP_STATE.editingExerciseId],
            ...exercise
        };
    } else {
        // Добавление нового
        APP_STATE.exercises.push(exercise);
    }
    
    saveDataToStorage();
    renderExerciseList();
    closeExerciseModal();
    
    // Вибрация при успехе (если поддерживается)
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function editExercise(index) {
    openExerciseModal(index);
}

function deleteExercise(index) {
    // Анимация удаления
    const card = document.querySelectorAll('.exercise-card')[index];
    card.style.transform = 'translateX(-100%)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        APP_STATE.exercises.splice(index, 1);
        saveDataToStorage();
        renderExerciseList();
        
        // Вибрация при удалении
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50]);
        }
    }, 300);
}

// ========================================
// ЭКРАН ВЫПОЛНЕНИЯ ТРЕНИРОВОК
// ========================================

function renderExecuteList() {
    const listContainer = document.getElementById('execute-list');
    const emptyState = document.getElementById('empty-execute');
    
    if (APP_STATE.exercises.length === 0) {
        listContainer.innerHTML = '';
        emptyState.classList.add('visible');
        return;
    }
    
    emptyState.classList.remove('visible');
    listContainer.innerHTML = '';
    
    APP_STATE.exercises.forEach((exercise, index) => {
        const card = createExecuteCard(exercise, index);
        listContainer.appendChild(card);
    });
}

function createExecuteCard(exercise, index) {
    const card = document.createElement('div');
    card.className = 'execute-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const progressKey = `exercise_${exercise.id}`;
    const completedSets = APP_STATE.todayProgress[progressKey] || [];
    
    // Проверка завершенности всех подходов
    const isFullyCompleted = completedSets.length === exercise.sets;
    if (isFullyCompleted) {
        card.classList.add('completed');
    }
    
    const setsHTML = Array.from({ length: exercise.sets }, (_, i) => {
        const setNumber = i + 1;
        const isChecked = completedSets.includes(setNumber);
        return `
            <div class="set-checkbox">
                <input 
                    type="checkbox" 
                    id="set_${exercise.id}_${setNumber}"
                    data-exercise-id="${exercise.id}"
                    data-set="${setNumber}"
                    ${isChecked ? 'checked' : ''}
                >
            </div>
        `;
    }).join('');
    
    card.innerHTML = `
        <div class="execute-header">
            <div class="execute-name">${escapeHtml(exercise.name)}</div>
            <div class="execute-info">
                ${exercise.reps} повторений × ${exercise.weight} кг
            </div>
        </div>
        <div class="sets-container">
            ${setsHTML}
        </div>
    `;
    
    // События для чекбоксов
    card.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleSetToggle);
    });
    
    return card;
}

function handleSetToggle(e) {
    const exerciseId = parseInt(e.target.dataset.exerciseId);
    const setNumber = parseInt(e.target.dataset.set);
    const progressKey = `exercise_${exerciseId}`;
    
    if (!APP_STATE.todayProgress[progressKey]) {
        APP_STATE.todayProgress[progressKey] = [];
    }
    
    if (e.target.checked) {
        // Добавление выполненного подхода
        if (!APP_STATE.todayProgress[progressKey].includes(setNumber)) {
            APP_STATE.todayProgress[progressKey].push(setNumber);
        }
        
        // Вибрация при выполнении
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    } else {
        // Удаление выполненного подхода
        APP_STATE.todayProgress[progressKey] = APP_STATE.todayProgress[progressKey].filter(
            s => s !== setNumber
        );
    }
    
    saveDataToStorage();
    
    // Проверка завершенности всех подходов
    const exercise = APP_STATE.exercises.find(ex => ex.id === exerciseId);
    if (exercise && APP_STATE.todayProgress[progressKey].length === exercise.sets) {
        const card = e.target.closest('.execute-card');
        card.classList.add('completed');
        
        // Вибрация при завершении всех подходов
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50, 100, 50]);
        }
    } else {
        const card = e.target.closest('.execute-card');
        card.classList.remove('completed');
    }
}

// ========================================
// СЧЕТЧИК КАЛОРИЙ
// ========================================

function renderCalories() {
    const today = new Date().toDateString();
    
    // Получение калорий за сегодня
    const todayEntry = APP_STATE.calories.history.find(entry => entry.date === today);
    const todayCalories = todayEntry ? todayEntry.calories : 0;
    
    document.getElementById('calorie-value').textContent = todayCalories.toLocaleString('ru-RU');
    
    // Рендер истории
    renderCaloriesHistory();
}

function handleCaloriesSave() {
    const input = document.getElementById('calorie-input');
    const calories = parseInt(input.value);
    
    if (!calories || calories < 0) {
        input.style.borderColor = 'var(--danger)';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 1000);
        return;
    }
    
    const today = new Date().toDateString();
    
    // Обновление или добавление записи
    const existingIndex = APP_STATE.calories.history.findIndex(entry => entry.date === today);
    
    if (existingIndex !== -1) {
        APP_STATE.calories.history[existingIndex].calories = calories;
    } else {
        APP_STATE.calories.history.unshift({
            date: today,
            calories: calories,
            timestamp: Date.now()
        });
    }
    
    // Ограничение истории 30 днями
    if (APP_STATE.calories.history.length > 30) {
        APP_STATE.calories.history = APP_STATE.calories.history.slice(0, 30);
    }
    
    saveDataToStorage();
    renderCalories();
    
    // Очистка поля и анимация
    input.value = '';
    input.style.borderColor = 'var(--success)';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 1000);
    
    // Вибрация
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function renderCaloriesHistory() {
    const historyList = document.getElementById('history-list');
    
    if (APP_STATE.calories.history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: var(--spacing-lg);">История пуста</div>';
        return;
    }
    
    historyList.innerHTML = '';
    
    // Показываем последние 7 записей
    const recentHistory = APP_STATE.calories.history.slice(0, 7);
    
    recentHistory.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
        });
        
        item.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-calories">${entry.calories.toLocaleString('ru-RU')} ккал</div>
        `;
        
        historyList.appendChild(item);
    });
}

// ========================================
// УТИЛИТЫ
// ========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Предотвращение масштабирования двойным тапом на iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Предотвращение pull-to-refresh на мобильных
let startY = 0;
document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
});

document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    if (y > startY && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

// ========================================
// SERVICE WORKER (для PWA)
// ========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован'))
            .catch(err => console.log('Ошибка Service Worker:', err));
    });
}
