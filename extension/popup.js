// ⚠️ ВНИМАНИЕ: URL обновлен для Railway hosting
// Railway URL для продакшена
const API_BASE = 'https://brokerpilot-stands-server-production.up.railway.app'; // ✅ RAILWAY URL

// DOM элементы
let standSelect, standInfo, standName, standDescription, standNodes, currentTasks, taskCount;
let taskInput, addTaskBtn, refreshBtn, connectionStatus, statusMessage;
let blockBtn, unblockBtn, blockInfo, blockReason, blockDate, addTaskForm;
let blockModal, blockForm, blockReasonInput, cancelBlockBtn, modalStandName;
let moveModal, moveForm, cancelMoveBtn;

// Данные приложения
let stands = [];
let selectedStand = null;

// Инициализация при открытии popup
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🚀 Stands Manager starting...');
    
    // Получить все DOM элементы
    initializeElements();
    
    // Установить обработчики событий
    attachEventListeners();
    
    // Загрузить данные стендов
    await loadStands();
}

function initializeElements() {
    standSelect = document.getElementById('standSelect');
    standInfo = document.getElementById('standInfo');
    standName = document.getElementById('standName');
    standDescription = document.getElementById('standDescription');
    standNodes = document.getElementById('standNodes');
    currentTasks = document.getElementById('currentTasks');
    taskCount = document.getElementById('taskCount');
    taskInput = document.getElementById('taskInput');
    addTaskBtn = document.getElementById('addTaskBtn');
    refreshBtn = document.getElementById('refreshBtn');
    connectionStatus = document.getElementById('connectionStatus');
    statusMessage = document.getElementById('statusMessage');
    
    // Новые элементы для блокировки
    blockBtn = document.getElementById('blockBtn');
    unblockBtn = document.getElementById('unblockBtn');
    blockInfo = document.getElementById('blockInfo');
    blockReason = document.getElementById('blockReason');
    blockDate = document.getElementById('blockDate');
    addTaskForm = document.getElementById('addTaskForm');
    
    // Модальное окно блокировки
    blockModal = document.getElementById('blockModal');
    blockForm = document.getElementById('blockForm');
    blockReasonInput = document.getElementById('blockReasonInput');
    cancelBlockBtn = document.getElementById('cancelBlockBtn');
    modalStandName = document.getElementById('modalStandName');
    
    // Модальное окно переноса
    moveModal = document.getElementById('moveModal');
    moveForm = document.getElementById('moveForm');
    cancelMoveBtn = document.getElementById('cancelMoveBtn');
}

function attachEventListeners() {
    // Выбор стенда
    standSelect.addEventListener('change', onStandSelect);
    
    // Добавление задачи
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTask();
        }
    });
    
    // Обновление данных
    refreshBtn.addEventListener('click', () => {
        loadStands(true);
    });
    
    // Блокировка стенда
    blockBtn.addEventListener('click', openBlockModal);
    unblockBtn.addEventListener('click', unblockStand);
    
    // Модальное окно блокировки
    blockForm.addEventListener('submit', blockStand);
    cancelBlockBtn.addEventListener('click', closeBlockModal);
    blockModal.addEventListener('click', (e) => {
        if (e.target === blockModal) {
            closeBlockModal();
        }
    });
    
    // Автоформатирование номера задачи
    taskInput.addEventListener('input', formatTaskInput);
}

function formatTaskInput(e) {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Только цифры
    if (value.length > 0) {
        e.target.value = value;
    }
}

async function loadStands(showRefreshMessage = false) {
    console.log('📡 Loading stands from server...');
    
    try {
        updateConnectionStatus(true, 'Подключение...');
        
        const response = await fetch(`${API_BASE}/stands`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        stands = await response.json();
        console.log('✅ Stands loaded:', stands.length);
        
        updateConnectionStatus(true, 'Подключено');
        populateStandSelect();
        
        // Сохранить выбранный стенд при обновлении
        if (selectedStand) {
            const updatedStand = stands.find(s => s.id === selectedStand.id);
            if (updatedStand) {
                selectedStand = updatedStand;
                showStandInfo();
            }
        }
        
        if (showRefreshMessage) {
            showStatus('Данные обновлены', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error loading stands:', error);
        updateConnectionStatus(false, 'Ошибка подключения');
        
        let errorMessage = 'Сервер недоступен';
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Проверьте, что сервер запущен';
        }
        
        showStatus(errorMessage, 'error');
        showConnectionHelp();
    }
}

function updateConnectionStatus(connected, message = '') {
    connectionStatus.textContent = connected ? '●' : '●';
    connectionStatus.className = connected ? 'status-indicator' : 'status-indicator offline';
    connectionStatus.title = message || (connected ? 'Подключено к серверу' : 'Нет подключения к серверу');
}

function showConnectionHelp() {
    if (stands.length === 0) {
        standSelect.innerHTML = `
            <option value="">❌ Сервер недоступен</option>
            <option value="" disabled>Проверьте что запущен start-server.bat</option>
            <option value="" disabled>IP адрес в popup.js: ${API_BASE}</option>
        `;
        standSelect.disabled = true;
    }
}

function populateStandSelect() {
    standSelect.disabled = false;
    standSelect.innerHTML = '<option value="">Выберите стенд...</option>';
    
    stands.forEach(stand => {
        const option = document.createElement('option');
        option.value = stand.id;
        
        let statusText;
        if (stand.blocked) {
            statusText = '🔒 ЗАБЛОКИРОВАН';
            option.classList.add('blocked');
            option.style.background = '#dc3545';
            option.style.color = 'white';
        } else if (stand.tasks.length === 0) {
            statusText = 'свободен';
        } else if (stand.tasks.length === 1) {
            statusText = '1 задача';
        } else {
            statusText = `${stand.tasks.length} задач`;
        }
        
        option.textContent = `${stand.name} (${statusText})`;
        standSelect.appendChild(option);
    });
}

function onStandSelect() {
    const standId = standSelect.value;
    
    if (!standId) {
        standInfo.classList.add('hidden');
        selectedStand = null;
        return;
    }
    
    selectedStand = stands.find(s => s.id === standId);
    if (selectedStand) {
        console.log('📋 Selected stand:', selectedStand.name);
        showStandInfo();
    }
}

function showStandInfo() {
    // Обновить заголовок
    standName.textContent = selectedStand.name;
    
    // Обновить количество задач
    const taskCountText = selectedStand.tasks.length === 0 ? '0 задач' : 
                         selectedStand.tasks.length === 1 ? '1 задача' : 
                         `${selectedStand.tasks.length} задач`;
    taskCount.textContent = taskCountText;
    
    // Обновить описание
    standDescription.textContent = selectedStand.description;
    
    // Показать/скрыть информацию о блокировке
    if (selectedStand.blocked) {
        blockInfo.classList.remove('hidden');
        blockReason.textContent = `Причина: ${selectedStand.blockReason}`;
        blockDate.textContent = `Заблокирован: ${new Date(selectedStand.blockDate).toLocaleString('ru-RU')}`;
        blockBtn.classList.add('hidden');
        addTaskForm.style.display = 'none'; // Скрыть форму добавления задач
    } else {
        blockInfo.classList.add('hidden');
        blockBtn.classList.remove('hidden');
        addTaskForm.style.display = 'flex'; // Показать форму добавления задач
    }
    
    // Показать ноды
    renderNodes();
    
    // Показать задачи
    renderTasks();
    
    // Очистить поле ввода
    taskInput.value = '';
    
    // Показать информационный блок
    standInfo.classList.remove('hidden');
    
    // Фокус на поле ввода задачи (если стенд не заблокирован)
    if (!selectedStand.blocked) {
        setTimeout(() => taskInput.focus(), 100);
    }
}

function renderNodes() {
    standNodes.innerHTML = selectedStand.nodes.map(node => 
        `<span class="node-tag">${node}</span>`
    ).join('');
}

function renderTasks() {
    if (selectedStand.tasks.length === 0) {
        currentTasks.innerHTML = '<div class="no-tasks">📭 Задач на стенде нет</div>';
        return;
    }
    
    currentTasks.innerHTML = selectedStand.tasks.map(task => {
        // Получить данные тестировщика для задачи
        const taskData = selectedStand.taskData && selectedStand.taskData[task];
        const assignedTester = taskData ? taskData.tester : '';
        
        return `
            <div class="task-item">
                <span class="task-number">#${task}</span>
                <div class="task-actions">
                    <select class="tester-select" data-task="${task}">
                        <option value="">Тестировщик</option>
                        <option value="Денис" ${assignedTester === 'Денис' ? 'selected' : ''}>Денис</option>
                        <option value="Матвей" ${assignedTester === 'Матвей' ? 'selected' : ''}>Матвей</option>
                    </select>
                    <button class="complete-task" data-task="${task}" title="Завершить задачу">✓</button>
                    <button class="move-task" data-task="${task}" title="Перенести задачу">⟲</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Добавить обработчики событий для кнопок
    currentTasks.querySelectorAll('.complete-task').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskToComplete = e.target.getAttribute('data-task');
            completeTask(taskToComplete);
        });
    });
    
    currentTasks.querySelectorAll('.move-task').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskToMove = e.target.getAttribute('data-task');
            openMoveModal(taskToMove);
        });
    });
    
    currentTasks.querySelectorAll('.tester-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const task = e.target.getAttribute('data-task');
            const tester = e.target.value;
            updateTaskTester(task, tester);
        });
    });
}

async function addTask() {
    const taskNumber = taskInput.value.trim();
    
    // Валидация
    if (!taskNumber) {
        showStatus('Введите номер задачи', 'error');
        taskInput.focus();
        return;
    }
    
    if (!selectedStand) {
        showStatus('Выберите стенд', 'error');
        return;
    }
    
    // Проверка блокировки стенда
    if (selectedStand.blocked) {
        showStatus('Стенд заблокирован - добавление задач невозможно', 'error');
        return;
    }
    
    // Проверка на дубликат на текущем стенде
    if (selectedStand.tasks.includes(taskNumber)) {
        showStatus(`Задача #${taskNumber} уже есть на стенде ${selectedStand.name}`, 'error');
        taskInput.focus();
        taskInput.select();
        return;
    }
    
    // Проверка на дубликат на других стендах
    const duplicateStand = stands.find(stand => 
        stand.id !== selectedStand.id && stand.tasks.includes(taskNumber)
    );
    
    if (duplicateStand) {
        alert(`❌ Ошибка: Задача #${taskNumber} уже добавлена на стенд "${duplicateStand.name}"`);
        taskInput.focus();
        taskInput.select();
        return;
    }
    
    console.log(`➕ Adding task #${taskNumber} to ${selectedStand.name}`);
    
    try {
        // Отключить кнопку во время добавления
        addTaskBtn.disabled = true;
        addTaskBtn.textContent = 'Добавление...';
        
        // Локально добавить задачу для мгновенного отображения
        selectedStand.tasks.push(taskNumber);
        selectedStand.status = 'busy';
        renderTasks();
        updateTaskCount();
        
        // Отправить на сервер
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Успешно добавлено
        console.log(`✅ Task #${taskNumber} added successfully`);
        showStatus(`Задача #${taskNumber} добавлена`, 'success');
        
        // Очистить поле и обновить селектор
        taskInput.value = '';
        populateStandSelect();
        taskInput.focus();
        
    } catch (error) {
        console.error('❌ Error adding task:', error);
        
        // Откатить локальные изменения
        const taskIndex = selectedStand.tasks.indexOf(taskNumber);
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 1);
            selectedStand.status = selectedStand.tasks.length > 0 ? 'busy' : 'free';
            renderTasks();
            updateTaskCount();
        }
        
        showStatus('Ошибка добавления задачи', 'error');
        
    } finally {
        // Восстановить кнопку
        addTaskBtn.disabled = false;
        addTaskBtn.textContent = 'Добавить';
    }
}

async function removeTask(taskToRemove) {
    if (!selectedStand) return;
    
    console.log(`➖ Removing task #${taskToRemove} from ${selectedStand.name}`);
    
    try {
        // Локально удалить задачу
        const taskIndex = selectedStand.tasks.indexOf(taskToRemove);
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 1);
            renderTasks();
            updateTaskCount();
        }
        
        // Отправить на сервер
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`✅ Task #${taskToRemove} removed successfully`);
        showStatus(`Задача #${taskToRemove} удалена`, 'success');
        populateStandSelect();
        
    } catch (error) {
        console.error('❌ Error removing task:', error);
        
        // Откатить изменения
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 0, taskToRemove);
            renderTasks();
            updateTaskCount();
        }
        
        showStatus('Ошибка удаления задачи', 'error');
    }
}

function updateTaskCount() {
    const taskCountText = selectedStand.tasks.length === 0 ? '0 задач' : 
                         selectedStand.tasks.length === 1 ? '1 задача' : 
                         `${selectedStand.tasks.length} задач`;
    taskCount.textContent = taskCountText;
}

function showStatus(message, type) {
    console.log(`📢 Status: ${message} (${type})`);
    
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    
    // Автоматически скрыть сообщение через 4 секунды
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 4000);
}

// Автоматическое обновление каждые 15 секунд
setInterval(() => {
    if (stands.length > 0) { // Обновлять только если есть подключение
        loadStands();
    }
}, 15000);

// Горячие клавиши
document.addEventListener('keydown', (e) => {
    // F5 или Ctrl+R - обновить
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        loadStands(true);
    }
    
    // Esc - закрыть информацию о стенде или модальное окно
    if (e.key === 'Escape') {
        if (!blockModal.classList.contains('hidden')) {
            closeBlockModal();
        } else {
            standSelect.value = '';
            standInfo.classList.add('hidden');
            selectedStand = null;
            standSelect.focus();
        }
    }
});

// Функции для блокировки стендов
function openBlockModal() {
    if (!selectedStand) return;
    
    modalStandName.textContent = selectedStand.name;
    blockReasonInput.value = '';
    blockModal.classList.remove('hidden');
    blockReasonInput.focus();
}

function closeBlockModal() {
    blockModal.classList.add('hidden');
}

async function blockStand(e) {
    e.preventDefault();
    
    const reason = blockReasonInput.value.trim();
    if (!reason) {
        showStatus('Укажите причину блокировки', 'error');
        return;
    }
    
    if (!selectedStand) return;
    
    console.log(`🔒 Blocking stand ${selectedStand.name}: ${reason}`);
    
    try {
        // Локально заблокировать стенд
        selectedStand.blocked = true;
        selectedStand.blockReason = reason;
        selectedStand.blockDate = new Date().toISOString();
        selectedStand.status = 'blocked';
        
        // Отправить на сервер
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        console.log(`✅ Stand ${selectedStand.name} blocked successfully`);
        showStatus(`Стенд ${selectedStand.name} заблокирован`, 'success');
        
        closeBlockModal();
        showStandInfo(); // Обновить отображение
        populateStandSelect(); // Обновить список стендов
        
    } catch (error) {
        console.error('❌ Error blocking stand:', error);
        
        // Откатить изменения
        selectedStand.blocked = false;
        selectedStand.blockReason = '';
        selectedStand.blockDate = '';
        selectedStand.status = 'free';
        
        showStatus('Ошибка блокировки стенда', 'error');
    }
}

async function unblockStand() {
    if (!selectedStand) return;
    
    console.log(`🔓 Unblocking stand ${selectedStand.name}`);
    
    try {
        // Локально разблокировать стенд
        selectedStand.blocked = false;
        selectedStand.blockReason = '';
        selectedStand.blockDate = '';
        selectedStand.status = selectedStand.tasks.length > 0 ? 'busy' : 'free';
        
        // Отправить на сервер
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        console.log(`✅ Stand ${selectedStand.name} unblocked successfully`);
        showStatus(`Стенд ${selectedStand.name} разблокирован`, 'success');
        
        showStandInfo(); // Обновить отображение
        populateStandSelect(); // Обновить список стендов
        
    } catch (error) {
        console.error('❌ Error unblocking stand:', error);
        
        // Откатить изменения
        selectedStand.blocked = true;
        selectedStand.status = 'blocked';
        
        showStatus('Ошибка разблокировки стенда', 'error');
    }
}

// Функция завершения задачи
async function completeTask(taskToComplete) {
    if (!selectedStand) return;
    
    console.log(`✅ Completing task #${taskToComplete} on ${selectedStand.name}`);
    
    try {
        // Локально удалить задачу из текущих
        const taskIndex = selectedStand.tasks.indexOf(taskToComplete);
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 1);
            renderTasks();
            updateTaskCount();
        }
        
        // Добавить в завершенные задачи
        const completedTask = {
            id: taskToComplete,
            standId: selectedStand.id,
            standName: selectedStand.name,
            completedDate: new Date().toISOString()
        };
        
        // Отправить обновления на сервер
        const [standResponse, completedResponse] = await Promise.all([
            fetch(`${API_BASE}/stands/${selectedStand.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedStand)
            }),
            fetch(`${API_BASE}/completedTasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(completedTask)
            })
        ]);
        
        if (!standResponse.ok || !completedResponse.ok) {
            throw new Error('Ошибка сохранения на сервере');
        }
        
        console.log(`✅ Task #${taskToComplete} completed successfully`);
        showStatus(`Задача #${taskToComplete} завершена`, 'success');
        populateStandSelect();
        
    } catch (error) {
        console.error('❌ Error completing task:', error);
        
        // Откатить изменения
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 0, taskToComplete);
            renderTasks();
            updateTaskCount();
        }
        
        showStatus('Ошибка завершения задачи', 'error');
    }
}

// Функция обновления тестировщика для задачи
async function updateTaskTester(taskId, tester) {
    if (!selectedStand) return;
    
    console.log(`👤 Updating tester for task #${taskId} to ${tester}`);
    
    try {
        // Инициализировать taskData если не существует
        if (!selectedStand.taskData) {
            selectedStand.taskData = {};
        }
        
        // Обновить тестировщика
        if (!selectedStand.taskData[taskId]) {
            selectedStand.taskData[taskId] = {};
        }
        selectedStand.taskData[taskId].tester = tester;
        
        // Отправить обновления на сервер
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сохранения на сервере');
        }
        
        console.log(`✅ Tester updated successfully for task #${taskId}`);
        showStatus(`Тестировщик "${tester}" назначен на задачу #${taskId}`, 'success');
        
    } catch (error) {
        console.error('❌ Error updating tester:', error);
        showStatus('Ошибка назначения тестировщика', 'error');
        // Перезагрузить данные для отката изменений
        renderTasks();
    }
}

// Функция открытия модального окна переноса
function openMoveModal(taskId) {
    const moveModal = document.getElementById('moveModal');
    const moveTaskIdElement = document.getElementById('moveTaskId');
    const moveFromStandElement = document.getElementById('moveFromStand');
    const moveToStandSelect = document.getElementById('moveToStandSelect');
    const moveForm = document.getElementById('moveForm');
    const cancelMoveBtn = document.getElementById('cancelMoveBtn');
    
    // Заполнить информацию о задаче
    moveTaskIdElement.textContent = taskId;
    moveFromStandElement.textContent = selectedStand.name;
    
    // Заполнить список стендов (исключить текущий и заблокированные)
    moveToStandSelect.innerHTML = '<option value="">Выберите стенд для переноса...</option>';
    stands.forEach(stand => {
        if (stand.id !== selectedStand.id && !stand.blocked) {
            const option = document.createElement('option');
            option.value = stand.id;
            const taskCountText = stand.tasks.length === 0 ? 'свободен' : 
                                 stand.tasks.length === 1 ? '1 задача' : 
                                 `${stand.tasks.length} задач`;
            option.textContent = `${stand.name} (${taskCountText})`;
            moveToStandSelect.appendChild(option);
        }
    });
    
    // Показать модальное окно
    moveModal.classList.remove('hidden');
    
    // Сохранить taskId для использования в обработчиках
    moveModal.dataset.taskId = taskId;
}

// Глобальные обработчики для модального окна переноса (устанавливаются один раз)
document.addEventListener('DOMContentLoaded', () => {
    const moveModal = document.getElementById('moveModal');
    const moveForm = document.getElementById('moveForm');
    const cancelMoveBtn = document.getElementById('cancelMoveBtn');
    
    if (moveForm) {
        moveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskId = moveModal.dataset.taskId;
            const targetStandId = document.getElementById('moveToStandSelect').value;
            if (taskId && targetStandId) {
                moveTask(taskId, targetStandId);
            }
        });
    }
    
    if (cancelMoveBtn) {
        cancelMoveBtn.addEventListener('click', () => {
            moveModal.classList.add('hidden');
        });
    }
    
    if (moveModal) {
        moveModal.addEventListener('click', (e) => {
            if (e.target === moveModal) {
                moveModal.classList.add('hidden');
            }
        });
    }
});

// Функция переноса задачи
async function moveTask(taskId, targetStandId) {
    const moveModal = document.getElementById('moveModal');
    const targetStand = stands.find(s => s.id === targetStandId);
    
    if (!targetStand) {
        showStatus('Целевой стенд не найден', 'error');
        return;
    }
    
    console.log(`🔄 Moving task #${taskId} from ${selectedStand.name} to ${targetStand.name}`);
    
    let taskIndex = -1;
    
    try {
        // Проверить, что задачи нет на целевом стенде
        if (targetStand.tasks.includes(taskId)) {
            alert(`❌ Ошибка: Задача #${taskId} уже есть на стенде "${targetStand.name}"`);
            return;
        }
        
        // Найти индекс задачи на текущем стенде
        taskIndex = selectedStand.tasks.indexOf(taskId);
        if (taskIndex === -1) {
            showStatus(`Задача #${taskId} не найдена на стенде ${selectedStand.name}`, 'error');
            return;
        }
        
        // Сохранить данные тестировщика если есть
        let taskData = null;
        if (selectedStand.taskData && selectedStand.taskData[taskId]) {
            taskData = { ...selectedStand.taskData[taskId] }; // создаем копию
        }
        
        // Создать обновленные данные для стендов
        const updatedSourceStand = {
            ...selectedStand,
            tasks: selectedStand.tasks.filter(t => t !== taskId),
            taskData: { ...selectedStand.taskData }
        };
        
        // Удалить данные задачи с исходного стенда
        if (updatedSourceStand.taskData[taskId]) {
            delete updatedSourceStand.taskData[taskId];
        }
        
        // Обновить статус исходного стенда
        updatedSourceStand.status = updatedSourceStand.tasks.length === 0 ? 'free' : 'busy';
        
        const updatedTargetStand = {
            ...targetStand,
            tasks: [...targetStand.tasks, taskId],
            taskData: { ...targetStand.taskData },
            status: 'busy'
        };
        
        // Добавить данные тестировщика на целевой стенд
        if (taskData) {
            updatedTargetStand.taskData[taskId] = taskData;
        }
        
        // Отправить обновления на сервер
        console.log('Sending updates to server...');
        const [sourceResponse, targetResponse] = await Promise.all([
            fetch(`${API_BASE}/stands/${selectedStand.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSourceStand)
            }),
            fetch(`${API_BASE}/stands/${targetStand.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTargetStand)
            })
        ]);
        
        if (!sourceResponse.ok) {
            throw new Error(`Ошибка обновления исходного стенда: ${sourceResponse.status}`);
        }
        
        if (!targetResponse.ok) {
            throw new Error(`Ошибка обновления целевого стенда: ${targetResponse.status}`);
        }
        
        // Обновить локальные данные только после успешного сохранения
        Object.assign(selectedStand, updatedSourceStand);
        Object.assign(targetStand, updatedTargetStand);
        
        console.log(`✅ Task #${taskId} moved successfully`);
        showStatus(`Задача #${taskId} перенесена на стенд "${targetStand.name}"`, 'success');
        
        // Обновить интерфейс
        renderTasks();
        updateTaskCount();
        populateStandSelect();
        moveModal.classList.add('hidden');
        
    } catch (error) {
        console.error('❌ Error moving task:', error);
        showStatus(`Ошибка переноса задачи: ${error.message}`, 'error');
        
        // Перезагрузить данные с сервера для отката изменений
        await loadStands();
    }
}

console.log('🎯 Stands Manager loaded successfully!');
console.log('📡 API Base URL:', API_BASE);
console.log('💡 Не забудь заменить IP адрес в строке 3!');
