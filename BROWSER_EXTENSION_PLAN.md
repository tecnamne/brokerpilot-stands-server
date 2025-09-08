# 🚀 План разработки браузерного расширения для управления стендами

## 📋 Общая информация

**Цель проекта:** Создать браузерное расширение для удобного управления тестовыми стендами BrokerPilot

**Архитектура:** Browser Extension + Local JSON Server API

**Временные затраты:** 7-10 дней (включая тестирование)

**Технологический стек:** 
- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: JSON Server (Node.js)
- Storage: Local JSON файл
- Browser: Chrome Extension Manifest V3

---

## 🎯 Этапы разработки

### 📅 **Этап 1: Настройка локального API (День 1)**

#### **1.1 Установка JSON Server**
```bash
# Глобальная установка
npm install -g json-server

# Проверка установки
json-server --version
```

#### **1.2 Создание структуры проекта**
```
brokerpilot-stands-manager/
├── api/
│   ├── stands.json          # База данных
│   ├── start-api.bat        # Автостарт для Windows
│   └── backup/              # Резервные копии
├── extension/
│   ├── manifest.json        # Конфигурация расширения
│   ├── popup.html           # UI интерфейс
│   ├── popup.js             # Логика popup
│   ├── popup.css            # Стили
│   ├── background.js        # Background script
│   └── icons/               # Иконки расширения
└── README.md
```

#### **1.3 Создание базы данных (stands.json)**
```json
{
  "stands": [
    {
      "id": "develop1",
      "name": "Develop1",
      "description": "Основной тестовый стенд",
      "nodes": ["DemoMT5", "MT5Indigosoft", "Second", "SuperNode"],
      "status": "free",
      "specialization": "Комплексное функциональное тестирование, интеграция MT4/MT5",
      "lastUpdated": "2025-09-02T10:00:00Z"
    },
    {
      "id": "develop2", 
      "name": "Develop2",
      "description": "Стабилизационный стенд",
      "nodes": ["SuperNode"],
      "status": "free",
      "specialization": "Стабилизация релизных версий, критические исправления",
      "lastUpdated": "2025-09-02T10:00:00Z"
    },
    {
      "id": "develop3",
      "name": "Develop3", 
      "description": "Производительность и нагрузка",
      "nodes": ["SuperNode"],
      "status": "free",
      "specialization": "Performance тестирование, нагрузочные тесты",
      "lastUpdated": "2025-09-02T10:00:00Z"
    },
    {
      "id": "develop4",
      "name": "Develop4",
      "description": "Полный функционал", 
      "nodes": ["CT_Indigosoft", "CT_Test", "MT4dev", "MT5dev", "MT5Indigosoft", "SuperNode", "HedgeNode"],
      "status": "free",
      "specialization": "Полное покрытие функциональности, регрессионное тестирование",
      "lastUpdated": "2025-09-02T10:00:00Z"
    }
  ],
  "tasks": [],
  "history": []
}
```

#### **1.4 Создание скрипта автостарта (start-api.bat)**
```batch
@echo off
title BrokerPilot Stands API Server
cd /d "%~dp0"
echo Starting BrokerPilot Stands API Server...
echo Server will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
json-server --watch stands.json --port 3001 --host 0.0.0.0
pause
```

#### **1.5 Тестирование API**
```bash
# Запуск сервера
json-server --watch stands.json --port 3001

# Тестовые запросы
curl http://localhost:3001/stands
curl http://localhost:3001/tasks
curl -X POST -H "Content-Type: application/json" -d '{"test":"data"}' http://localhost:3001/tasks
```

---

### 🖥️ **Этап 2: Разработка Browser Extension (Дни 2-3)**

#### **2.1 Создание manifest.json**
```json
{
  "manifest_version": 3,
  "name": "BrokerPilot Stands Manager",
  "version": "1.0.0",
  "description": "Управление тестовыми стендами BrokerPilot",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "http://localhost:3001/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "BrokerPilot Stands",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png", 
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

#### **2.2 Создание popup.html**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ BrokerPilot Stands</h1>
            <div class="status-indicator" id="apiStatus">●</div>
        </div>
        
        <div class="stands-container">
            <div class="stands-list" id="standsList">
                <!-- Динамически генерируется -->
            </div>
        </div>
        
        <div class="actions">
            <button id="refreshBtn" class="btn btn-primary">🔄 Обновить</button>
            <button id="addTaskBtn" class="btn btn-success">+ Задача</button>
        </div>
        
        <!-- Модальное окно для добавления задачи -->
        <div id="taskModal" class="modal hidden">
            <div class="modal-content">
                <h3>Добавить задачу</h3>
                <form id="taskForm">
                    <input type="hidden" id="taskStandId">
                    <label>Номер задачи:</label>
                    <input type="text" id="taskId" placeholder="#1234" required>
                    
                    <label>Название:</label>
                    <input type="text" id="taskTitle" placeholder="Тестирование API" required>
                    
                    <label>Исполнитель:</label>
                    <input type="text" id="taskAssignee" placeholder="Анна Смирнова" required>
                    
                    <label>Примечания:</label>
                    <textarea id="taskNotes" placeholder="Дополнительная информация"></textarea>
                    
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-success">Добавить</button>
                        <button type="button" id="cancelTaskBtn" class="btn btn-secondary">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <script src="popup.js"></script>
</body>
</html>
```

#### **2.3 Создание popup.css**
```css
body {
    width: 400px;
    max-height: 600px;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
}

.container {
    padding: 16px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e0e0e0;
}

.header h1 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.status-indicator {
    font-size: 12px;
    color: #4CAF50;
}

.status-indicator.offline {
    color: #f44336;
}

.stands-list {
    max-height: 400px;
    overflow-y: auto;
}

.stand-item {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
}

.stand-item:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}

.stand-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.stand-name {
    font-weight: 600;
    font-size: 16px;
    color: #333;
}

.stand-status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.status-free { background-color: #e8f5e8; color: #2e7d32; }
.status-busy { background-color: #ffebee; color: #c62828; }
.status-blocked { background-color: #fff3e0; color: #ef6c00; }
.status-partial { background-color: #fff8e1; color: #f57f17; }

.stand-nodes {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
}

.stand-tasks {
    margin-top: 8px;
}

.task-item {
    background-color: #f9f9f9;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    font-size: 13px;
}

.task-header {
    font-weight: 500;
    color: #333;
}

.task-assignee {
    color: #666;
    font-size: 12px;
}

.actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    flex: 1;
}

.btn-primary {
    background-color: #2196F3;
    color: white;
}

.btn-primary:hover {
    background-color: #1976D2;
}

.btn-success {
    background-color: #4CAF50;
    color: white;
}

.btn-success:hover {
    background-color: #45a049;
}

.btn-secondary {
    background-color: #757575;
    color: white;
}

.btn-secondary:hover {
    background-color: #616161;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal.hidden {
    display: none;
}

.modal-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-content h3 {
    margin: 0 0 20px 0;
    color: #333;
}

.modal-content label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #555;
}

.modal-content input,
.modal-content textarea {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 14px;
    box-sizing: border-box;
}

.modal-content input:focus,
.modal-content textarea:focus {
    outline: none;
    border-color: #2196F3;
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.error {
    background-color: #ffebee;
    color: #c62828;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    text-align: center;
}
```

#### **2.4 Создание popup.js**
```javascript
// API Configuration
const API_BASE = 'http://localhost:3001';

// DOM Elements
let standsList, apiStatus, refreshBtn, addTaskBtn;
let taskModal, taskForm, taskStandId, taskId, taskTitle, taskAssignee, taskNotes;
let cancelTaskBtn;

// State
let currentStands = [];
let selectedStandId = null;

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    attachEventListeners();
    await loadStands();
});

function initializeElements() {
    standsList = document.getElementById('standsList');
    apiStatus = document.getElementById('apiStatus');
    refreshBtn = document.getElementById('refreshBtn');
    addTaskBtn = document.getElementById('addTaskBtn');
    
    taskModal = document.getElementById('taskModal');
    taskForm = document.getElementById('taskForm');
    taskStandId = document.getElementById('taskStandId');
    taskId = document.getElementById('taskId');
    taskTitle = document.getElementById('taskTitle');
    taskAssignee = document.getElementById('taskAssignee');
    taskNotes = document.getElementById('taskNotes');
    cancelTaskBtn = document.getElementById('cancelTaskBtn');
}

function attachEventListeners() {
    refreshBtn.addEventListener('click', loadStands);
    addTaskBtn.addEventListener('click', () => openTaskModal());
    cancelTaskBtn.addEventListener('click', closeTaskModal);
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Close modal on background click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
}

async function loadStands() {
    try {
        showLoading();
        
        const [standsResponse, tasksResponse] = await Promise.all([
            fetch(`${API_BASE}/stands`),
            fetch(`${API_BASE}/tasks`)
        ]);
        
        if (!standsResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const stands = await standsResponse.json();
        const tasks = await tasksResponse.json();
        
        currentStands = stands.map(stand => ({
            ...stand,
            tasks: tasks.filter(task => task.standId === stand.id)
        }));
        
        updateApiStatus(true);
        renderStands();
        
    } catch (error) {
        console.error('Error loading stands:', error);
        updateApiStatus(false);
        showError('Не удалось подключиться к API серверу. Убедитесь, что JSON Server запущен на порту 3001.');
    }
}

function updateApiStatus(online) {
    apiStatus.textContent = online ? '●' : '●';
    apiStatus.className = online ? 'status-indicator' : 'status-indicator offline';
    apiStatus.title = online ? 'API Server Online' : 'API Server Offline';
}

function showLoading() {
    standsList.innerHTML = '<div class="loading">⏳ Загрузка стендов...</div>';
}

function showError(message) {
    standsList.innerHTML = `<div class="error">${message}</div>`;
}

function renderStands() {
    if (currentStands.length === 0) {
        standsList.innerHTML = '<div class="loading">📭 Нет доступных стендов</div>';
        return;
    }
    
    standsList.innerHTML = currentStands.map(stand => `
        <div class="stand-item" data-stand-id="${stand.id}">
            <div class="stand-header">
                <div class="stand-name">${stand.name}</div>
                <div class="stand-status status-${getStatusClass(stand)}">
                    ${getStatusText(stand)}
                </div>
            </div>
            
            <div class="stand-nodes">
                <strong>Ноды:</strong> ${stand.nodes.join(', ')}
            </div>
            
            ${stand.tasks.length > 0 ? `
                <div class="stand-tasks">
                    <strong>Активные задачи:</strong>
                    ${stand.tasks.map(task => `
                        <div class="task-item">
                            <div class="task-header">${task.id} - ${task.title}</div>
                            <div class="task-assignee">👤 ${task.assignee}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Add click handlers for stands
    document.querySelectorAll('.stand-item').forEach(item => {
        item.addEventListener('click', () => {
            const standId = item.dataset.standId;
            openTaskModal(standId);
        });
    });
}

function getStatusClass(stand) {
    if (stand.status === 'blocked') return 'blocked';
    if (stand.tasks.length === 0) return 'free';
    if (stand.tasks.length === 1) return 'busy';
    return 'partial';
}

function getStatusText(stand) {
    if (stand.status === 'blocked') return '⛔ ЗАБЛОКИРОВАН';
    if (stand.tasks.length === 0) return '🟢 СВОБОДЕН';
    if (stand.tasks.length === 1) return '🔴 ЗАНЯТ';
    return `🟡 ЧАСТИЧНО (${stand.tasks.length})`;
}

function openTaskModal(standId = null) {
    selectedStandId = standId;
    taskStandId.value = standId || '';
    
    // Reset form
    taskId.value = '';
    taskTitle.value = '';
    taskAssignee.value = '';
    taskNotes.value = '';
    
    // Show selected stand in form if applicable
    if (standId) {
        const stand = currentStands.find(s => s.id === standId);
        if (stand) {
            // You could add a field to show which stand is selected
        }
    }
    
    taskModal.classList.remove('hidden');
    taskId.focus();
}

function closeTaskModal() {
    taskModal.classList.add('hidden');
    selectedStandId = null;
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const task = {
        id: taskId.value,
        title: taskTitle.value,
        assignee: taskAssignee.value,
        notes: taskNotes.value,
        standId: selectedStandId || taskStandId.value,
        startDate: new Date().toISOString(),
        status: 'active'
    };
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        closeTaskModal();
        await loadStands();
        
        // Show success notification (optional)
        showNotification(`Задача ${task.id} добавлена на стенд ${task.standId}`, 'success');
        
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Ошибка при добавлении задачи', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    if (type === 'success') notification.style.backgroundColor = '#4CAF50';
    if (type === 'error') notification.style.backgroundColor = '#f44336';
    if (type === 'info') notification.style.backgroundColor = '#2196F3';
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTaskModal();
    }
    
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        loadStands();
    }
});
```

#### **2.5 Создание background.js**
```javascript
// Background script for Chrome Extension
// Handles extension lifecycle and background tasks

chrome.runtime.onInstalled.addListener(() => {
    console.log('BrokerPilot Stands Manager extension installed');
    
    // Set default settings
    chrome.storage.local.set({
        apiUrl: 'http://localhost:3001',
        autoRefresh: true,
        refreshInterval: 30000 // 30 seconds
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked');
});

// Optional: Background refresh functionality
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'refreshStands') {
        // Refresh stands data in background
        refreshStandsData();
    }
});

async function refreshStandsData() {
    try {
        const response = await fetch('http://localhost:3001/stands');
        if (response.ok) {
            const stands = await response.json();
            // Store updated data
            chrome.storage.local.set({ lastStandsUpdate: Date.now(), stands });
        }
    } catch (error) {
        console.error('Background refresh failed:', error);
    }
}

// Set up periodic refresh
chrome.storage.local.get(['autoRefresh', 'refreshInterval'], (result) => {
    if (result.autoRefresh) {
        chrome.alarms.create('refreshStands', {
            delayInMinutes: 1,
            periodInMinutes: (result.refreshInterval || 30000) / 60000
        });
    }
});
```

---

### 🎨 **Этап 3: Создание иконок и доработка UI (День 4)**

#### **3.1 Создание иконок расширения**
- Создать иконки размером 16x16, 32x32, 48x48, 128x128 пикселей
- Использовать тематику BrokerPilot (цвета: синий, зеленый)
- Сохранить в папку `extension/icons/`

#### **3.2 Улучшение пользовательского интерфейса**
- Добавить анимации переходов
- Улучшить responsive дизайн
- Добавить темную тему (опционально)
- Добавить горячие клавиши

#### **3.3 Добавление дополнительного функционала**
- Поиск по стендам и задачам
- Фильтрация по статусам
- Экспорт данных в CSV
- История изменений

---

### 🔧 **Этап 4: Расширение функционала API (День 5)**

#### **4.1 Добавление новых эндпоинтов**
Создать файл `custom-routes.js`:
```javascript
module.exports = (req, res, next) => {
    // Custom endpoint for task management
    if (req.path === '/api/deploy-task' && req.method === 'POST') {
        const { taskId, standId, title, assignee } = req.body;
        
        // Add task to stand
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('stands.json'));
        
        const newTask = {
            id: taskId,
            title,
            assignee,
            standId,
            startDate: new Date().toISOString(),
            status: 'active'
        };
        
        data.tasks.push(newTask);
        
        // Update stand status
        const stand = data.stands.find(s => s.id === standId);
        if (stand) {
            stand.status = 'busy';
            stand.lastUpdated = new Date().toISOString();
        }
        
        // Add to history
        data.history.push({
            action: 'deploy',
            task: newTask,
            timestamp: new Date().toISOString()
        });
        
        fs.writeFileSync('stands.json', JSON.stringify(data, null, 2));
        res.json({ success: true, task: newTask });
        
    } else {
        next();
    }
};
```

#### **4.2 Обновленный запуск с custom middleware**
```bash
json-server --watch stands.json --port 3001 --middlewares custom-routes.js
```

---

### 🔄 **Этап 5: Синхронизация и резервное копирование (День 6)**

#### **5.1 Автоматическое резервное копирование**
Создать файл `backup-script.js`:
```javascript
const fs = require('fs');
const path = require('path');

function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backup');
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    
    const sourceFile = path.join(__dirname, 'stands.json');
    const backupFile = path.join(backupDir, `stands-${timestamp}.json`);
    
    fs.copyFileSync(sourceFile, backupFile);
    console.log(`Backup created: ${backupFile}`);
    
    // Keep only last 10 backups
    const backups = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('stands-'))
        .sort()
        .reverse();
    
    if (backups.length > 10) {
        backups.slice(10).forEach(file => {
            fs.unlinkSync(path.join(backupDir, file));
        });
    }
}

// Create backup every hour
setInterval(createBackup, 60 * 60 * 1000);

// Create backup on startup
createBackup();

module.exports = { createBackup };
```

#### **5.2 Git интеграция для командной работы**
Создать файл `git-sync.js`:
```javascript
const { exec } = require('child_process');
const fs = require('fs');

function syncWithGit() {
    const commands = [
        'git add stands.json',
        `git commit -m "Auto-update stands data: ${new Date().toISOString()}"`,
        'git pull origin main',
        'git push origin main'
    ];
    
    commands.forEach((command, index) => {
        setTimeout(() => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Git sync error: ${error}`);
                    return;
                }
                console.log(`Git: ${stdout}`);
            });
        }, index * 1000);
    });
}

// Sync every 5 minutes
setInterval(syncWithGit, 5 * 60 * 1000);

module.exports = { syncWithGit };
```

---

### 🧪 **Этап 6: Тестирование и отладка (День 7)**

#### **6.1 Unit тестирование API**
```javascript
// test-api.js
const assert = require('assert');

async function testAPI() {
    const baseUrl = 'http://localhost:3001';
    
    // Test 1: Get all stands
    const standsResponse = await fetch(`${baseUrl}/stands`);
    assert(standsResponse.ok, 'Failed to fetch stands');
    
    // Test 2: Add task
    const newTask = {
        id: 'TEST-001',
        title: 'Test Task',
        assignee: 'Test User',
        standId: 'develop1'
    };
    
    const addTaskResponse = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });
    
    assert(addTaskResponse.ok, 'Failed to add task');
    
    console.log('✅ All API tests passed');
}

testAPI().catch(console.error);
```

#### **6.2 Тестирование расширения**
- Загрузить расширение в Chrome (Developer mode)
- Протестировать все функции UI
- Проверить обработку ошибок
- Тестировать на разных разрешениях экрана

#### **6.3 Стресс-тестирование**
- Добавить множество задач
- Проверить производительность при большом количестве данных
- Тестировать отключение/подключение API сервера

---

### 📦 **Этап 7: Упаковка и развертывание (День 8)**

#### **7.1 Создание пакета расширения**
```bash
# Создать ZIP архив расширения
cd extension/
zip -r ../brokerpilot-stands-manager.zip *
```

#### **7.2 Создание установочного пакета**
Создать файл `install.bat`:
```batch
@echo off
echo BrokerPilot Stands Manager - Installation
echo =====================================
echo.

echo 1. Installing JSON Server...
call npm install -g json-server

echo 2. Creating directories...
if not exist "%USERPROFILE%\BrokerPilot\stands-manager" mkdir "%USERPROFILE%\BrokerPilot\stands-manager"

echo 3. Copying files...
xcopy /E /I api "%USERPROFILE%\BrokerPilot\stands-manager\api"

echo 4. Creating shortcuts...
echo @echo off > "%USERPROFILE%\Desktop\BrokerPilot Stands API.bat"
echo cd /d "%USERPROFILE%\BrokerPilot\stands-manager\api" >> "%USERPROFILE%\Desktop\BrokerPilot Stands API.bat"
echo start-api.bat >> "%USERPROFILE%\Desktop\BrokerPilot Stands API.bat"

echo.
echo Installation completed!
echo.
echo Next steps:
echo 1. Load extension in Chrome from 'extension' folder
echo 2. Run 'BrokerPilot Stands API.bat' from Desktop
echo 3. Open extension from Chrome toolbar
echo.
pause
```

#### **7.3 Создание документации**
Создать файл `USAGE.md` с инструкциями:
- Установка и настройка
- Руководство пользователя
- Troubleshooting
- FAQ

---

## 🚀 **Итоговые файлы проекта**

### **Структура проекта:**
```
brokerpilot-stands-manager/
├── api/
│   ├── stands.json              # База данных
│   ├── start-api.bat            # Запуск сервера
│   ├── custom-routes.js         # Дополнительные API эндпоинты
│   ├── backup-script.js         # Автобэкап
│   ├── git-sync.js              # Git синхронизация
│   └── backup/                  # Папка для бэкапов
├── extension/
│   ├── manifest.json            # Конфигурация расширения
│   ├── popup.html               # UI
│   ├── popup.js                 # Логика
│   ├── popup.css                # Стили
│   ├── background.js            # Background процессы
│   └── icons/                   # Иконки
├── tests/
│   ├── test-api.js              # Тесты API
│   └── test-extension.js        # Тесты расширения
├── install.bat                  # Установщик
├── USAGE.md                     # Документация
├── README.md                    # Описание проекта
└── brokerpilot-stands-manager.zip # Готовый пакет
```

---

## 📋 **Чек-лист выполнения**

### **✅ Основной функционал**
- [ ] API сервер на JSON Server
- [ ] Базовая структура данных (стенды, задачи, история)
- [ ] Chrome Extension с popup интерфейсом
- [ ] Отображение списка стендов с нодами
- [ ] Добавление задач на стенды
- [ ] Статусы стендов (свободен/занят/заблокирован)
- [ ] Обработка ошибок подключения к API

### **✅ Дополнительный функционал**
- [ ] Автоматическое резервное копирование
- [ ] Git синхронизация для командной работы
- [ ] История изменений
- [ ] Поиск и фильтрация
- [ ] Горячие клавиши
- [ ] Уведомления

### **✅ Качество кода**
- [ ] Unit тесты для API
- [ ] Обработка всех edge cases
- [ ] Responsive дизайн
- [ ] Оптимизация производительности
- [ ] Документация кода

### **✅ Развертывание**
- [ ] Упаковка расширения в ZIP
- [ ] Автоматический установщик
- [ ] Документация пользователя
- [ ] Инструкции по troubleshooting

---

## 🔧 **Команды для запуска**

### **Разработка:**
```bash
# Запуск API сервера
cd api && json-server --watch stands.json --port 3001

# Загрузка расширения в Chrome
1. Открыть chrome://extensions/
2. Включить Developer mode
3. Load unpacked -> выбрать папку extension/
```

### **Продакшн:**
```bash
# Запуск готового API
cd api && start-api.bat

# Установка расширения
1. Распаковать brokerpilot-stands-manager.zip
2. Следовать инструкциям в USAGE.md
```

---

## 🎯 **Перспективы развития**

### **Фаза 2 (будущие улучшения):**
- 🔄 Real-time обновления через WebSockets
- 📊 Dashboard с аналитикой использования стендов
- 🔔 Push-уведомления о статусах стендов
- 🔗 Интеграция с Jira/Azure DevOps
- 👥 Многопользовательский режим с ролями
- 📱 Мобильное приложение
- 🤖 Slack/Teams бот для управления стендами
- 📈 Метрики и отчетность

### **Фаза 3 (автоматизация):**
- 🚀 Автоматическое развертывание задач из CI/CD
- 🔍 Мониторинг состояния стендов
- 🎯 Умное распределение задач по стендам
- 🔐 Интеграция с Active Directory/LDAP
- ☁️ Cloud-версия с SaaS моделью

---

**🎉 Готово! Детальный план на 8 дней разработки с полным техническим стеком и пошаговыми инструкциями.**
