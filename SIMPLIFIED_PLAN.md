# 🎯 Упрощенный план браузерного расширения для команды

## 📋 Требования

1. **Простой интерфейс:** Раскрывающийся список стендов
2. **Информация о стенде:** Описание, ноды, текущие задачи
3. **Ручной ввод задач:** Номера задач вводятся пользователями
4. **Командная синхронизация:** Все изменения видны всем участникам
5. **Приватное развертывание:** Только для членов команды
6. **Сервер на твоем ПК:** Без сторонних сервисов

## 🏗️ Архитектура решения

```
[Твой ПК - JSON Server] ←→ [Сеть/WiFi] ←→ [ПК участников команды - Chrome Extension]
```

### Компоненты:
- **Сервер:** JSON Server на твоем ПК (порт 3001)
- **База данных:** Локальный JSON файл
- **Клиент:** Chrome Extension на ПК каждого участника
- **Синхронизация:** HTTP запросы к централизованному серверу

## 🚀 Этапы реализации (упрощенные)

### Этап 1: Настройка сервера на твоем ПК (30 минут)

#### 1.1 Установка Node.js и JSON Server
```powershell
# Установить Node.js с nodejs.org
# Потом установить json-server глобально
npm install -g json-server
```

#### 1.2 Создание базы данных
Файл `stands.json`:
```json
{
  "stands": [
    {
      "id": "develop1",
      "name": "Develop1",
      "description": "Основной тестовый стенд",
      "nodes": ["DemoMT5", "MT5Indigosoft", "Second", "SuperNode"],
      "tasks": []
    },
    {
      "id": "develop2",
      "name": "Develop2", 
      "description": "Стабилизационный стенд",
      "nodes": ["SuperNode"],
      "tasks": []
    },
    {
      "id": "develop3",
      "name": "Develop3",
      "description": "Производительность и нагрузка", 
      "nodes": ["SuperNode"],
      "tasks": []
    },
    {
      "id": "develop4",
      "name": "Develop4",
      "description": "Полный функционал",
      "nodes": ["CT_Indigosoft", "CT_Test", "MT4dev", "MT5dev", "MT5Indigosoft", "SuperNode", "HedgeNode"],
      "tasks": []
    }
  ]
}
```

#### 1.3 Запуск сервера с доступом по сети
```powershell
# Запуск с доступом для всех IP адресов
json-server --watch stands.json --port 3001 --host 0.0.0.0
```

#### 1.4 Получение IP адреса твоего ПК
```powershell
ipconfig | findstr "IPv4"
# Например: 192.168.1.100
```

### Этап 2: Создание простого расширения (1-2 часа)

#### 2.1 Структура расширения
```
extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
└── icon.png
```

#### 2.2 Manifest.json (минимальный)
```json
{
  "manifest_version": 3,
  "name": "Stands Manager",
  "version": "1.0",
  "description": "Управление стендами команды",
  "permissions": ["storage"],
  "host_permissions": ["http://192.168.1.100:3001/*"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Stands Manager"
  }
}
```

#### 2.3 Простой UI (popup.html)
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div class="container">
        <h2>🏗️ Стенды</h2>
        
        <select id="standSelect">
            <option value="">Выберите стенд...</option>
        </select>
        
        <div id="standInfo" class="hidden">
            <h3 id="standName"></h3>
            <p id="standDescription"></p>
            
            <div class="section">
                <strong>Ноды:</strong>
                <div id="standNodes"></div>
            </div>
            
            <div class="section">
                <strong>Текущие задачи:</strong>
                <div id="currentTasks"></div>
                
                <div class="add-task">
                    <input type="text" id="taskInput" placeholder="Номер задачи (например: #1234)">
                    <button id="addTaskBtn">Добавить</button>
                </div>
            </div>
        </div>
        
        <div id="status"></div>
    </div>
    
    <script src="popup.js"></script>
</body>
</html>
```

#### 2.4 Простые стили (popup.css)
```css
body {
    width: 350px;
    padding: 0;
    margin: 0;
    font-family: Arial, sans-serif;
}

.container {
    padding: 15px;
}

h2 {
    margin: 0 0 15px 0;
    color: #333;
}

select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.hidden {
    display: none;
}

.section {
    margin: 15px 0;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
}

.add-task {
    margin-top: 10px;
}

.add-task input {
    width: 200px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.add-task button {
    padding: 6px 12px;
    background: #007cba;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    margin-left: 5px;
}

.add-task button:hover {
    background: #005a87;
}

.task-item {
    background: white;
    padding: 8px;
    margin: 5px 0;
    border-radius: 3px;
    border: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.remove-task {
    background: #dc3545;
    color: white;
    border: none;
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.remove-task:hover {
    background: #c82333;
}

#status {
    margin-top: 15px;
    padding: 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
}

.status-success {
    background: #d4edda;
    color: #155724;
}

.status-error {
    background: #f8d7da;
    color: #721c24;
}
```

#### 2.5 Логика (popup.js)
```javascript
// Конфигурация - ЗАМЕНИ IP НА СВОЙ!
const API_BASE = 'http://192.168.1.100:3001';

// DOM элементы
let standSelect, standInfo, standName, standDescription, standNodes, currentTasks;
let taskInput, addTaskBtn, status;

// Данные
let stands = [];
let selectedStand = null;

// Инициализация
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Получить элементы
    standSelect = document.getElementById('standSelect');
    standInfo = document.getElementById('standInfo');
    standName = document.getElementById('standName');
    standDescription = document.getElementById('standDescription');
    standNodes = document.getElementById('standNodes');
    currentTasks = document.getElementById('currentTasks');
    taskInput = document.getElementById('taskInput');
    addTaskBtn = document.getElementById('addTaskBtn');
    status = document.getElementById('status');
    
    // Обработчики событий
    standSelect.addEventListener('change', onStandSelect);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Загрузить данные
    loadStands();
}

async function loadStands() {
    try {
        const response = await fetch(`${API_BASE}/stands`);
        if (!response.ok) throw new Error('Сервер недоступен');
        
        stands = await response.json();
        populateStandSelect();
        showStatus('Подключено к серверу', 'success');
        
    } catch (error) {
        console.error('Error loading stands:', error);
        showStatus('Ошибка подключения к серверу', 'error');
    }
}

function populateStandSelect() {
    standSelect.innerHTML = '<option value="">Выберите стенд...</option>';
    stands.forEach(stand => {
        const option = document.createElement('option');
        option.value = stand.id;
        option.textContent = `${stand.name} (${stand.tasks.length} задач)`;
        standSelect.appendChild(option);
    });
}

function onStandSelect() {
    const standId = standSelect.value;
    if (!standId) {
        standInfo.classList.add('hidden');
        return;
    }
    
    selectedStand = stands.find(s => s.id === standId);
    if (selectedStand) {
        showStandInfo();
    }
}

function showStandInfo() {
    standName.textContent = selectedStand.name;
    standDescription.textContent = selectedStand.description;
    standNodes.textContent = selectedStand.nodes.join(', ');
    
    renderTasks();
    standInfo.classList.remove('hidden');
}

function renderTasks() {
    if (selectedStand.tasks.length === 0) {
        currentTasks.innerHTML = '<div style="color: #666; font-style: italic;">Задач нет</div>';
        return;
    }
    
    currentTasks.innerHTML = selectedStand.tasks.map(task => `
        <div class="task-item">
            <span>${task}</span>
            <button class="remove-task" onclick="removeTask('${task}')">✕</button>
        </div>
    `).join('');
}

async function addTask() {
    const taskNumber = taskInput.value.trim();
    if (!taskNumber || !selectedStand) return;
    
    // Добавить # если не указан
    const formattedTask = taskNumber.startsWith('#') ? taskNumber : `#${taskNumber}`;
    
    // Проверить дубликат
    if (selectedStand.tasks.includes(formattedTask)) {
        showStatus('Задача уже существует', 'error');
        return;
    }
    
    try {
        // Добавить задачу локально
        selectedStand.tasks.push(formattedTask);
        
        // Обновить на сервере
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) throw new Error('Ошибка сохранения');
        
        // Обновить UI
        taskInput.value = '';
        renderTasks();
        populateStandSelect(); // Обновить количество задач в селекте
        showStatus(`Задача ${formattedTask} добавлена`, 'success');
        
    } catch (error) {
        // Откатить изменения
        selectedStand.tasks.pop();
        showStatus('Ошибка добавления задачи', 'error');
    }
}

async function removeTask(taskToRemove) {
    if (!selectedStand) return;
    
    try {
        // Удалить задачу локально
        const taskIndex = selectedStand.tasks.indexOf(taskToRemove);
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 1);
        }
        
        // Обновить на сервере
        const response = await fetch(`${API_BASE}/stands/${selectedStand.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStand)
        });
        
        if (!response.ok) throw new Error('Ошибка сохранения');
        
        // Обновить UI
        renderTasks();
        populateStandSelect();
        showStatus(`Задача ${taskToRemove} удалена`, 'success');
        
    } catch (error) {
        // Откатить изменения
        if (taskIndex > -1) {
            selectedStand.tasks.splice(taskIndex, 0, taskToRemove);
        }
        showStatus('Ошибка удаления задачи', 'error');
    }
}

function showStatus(message, type) {
    status.textContent = message;
    status.className = `status-${type}`;
    setTimeout(() => {
        status.textContent = '';
        status.className = '';
    }, 3000);
}

// Обновление каждые 10 секунд
setInterval(loadStands, 10000);
```

### Этап 3: Настройка для команды (15 минут)

#### 3.1 Настройка Windows Firewall
```powershell
# Открыть порт 3001 для входящих соединений
netsh advfirewall firewall add rule name="Stands Server" dir=in action=allow protocol=TCP localport=3001
```

#### 3.2 Создание batch файла для автозапуска
`start-server.bat`:
```batch
@echo off
title Stands Manager Server
cd /d "%~dp0"
echo ========================================
echo    Stands Manager Server
echo ========================================
echo.
echo Server starting on port 3001...
echo Your IP: %computername%
ipconfig | findstr "IPv4"
echo.
echo Press Ctrl+C to stop server
echo ========================================
echo.
json-server --watch stands.json --port 3001 --host 0.0.0.0
pause
```

### Этап 4: Распространение в команде

#### 4.1 Упаковка расширения
Создать ZIP архив папки `extension/` и назвать его `stands-manager.zip`

#### 4.2 Инструкция для команды
```
1. Получить файл stands-manager.zip
2. Открыть Chrome -> Настройки -> Расширения
3. Включить "Режим разработчика"
4. Нажать "Загрузить распакованное расширение"
5. Выбрать папку с распакованным расширением
6. В popup.js заменить IP адрес на актуальный
```

## 📋 Итоговая структура проекта

```
stands-manager/
├── server/
│   ├── stands.json          # База данных
│   ├── start-server.bat     # Автозапуск сервера
│   └── backup/              # Резервные копии (опционально)
├── extension/
│   ├── manifest.json        # Конфигурация расширения  
│   ├── popup.html           # UI
│   ├── popup.js             # Логика (УКАЗАТЬ СВОЙ IP!)
│   ├── popup.css            # Стили
│   └── icon.png             # Иконка расширения
├── stands-manager.zip       # Готовое расширение для команды
└── README.md                # Инструкции
```

## ⚡ Быстрый старт

1. **На твоем ПК:**
   ```powershell
   npm install -g json-server
   # Запустить start-server.bat
   ```

2. **У каждого в команде:**
   - Установить расширение из ZIP
   - Убедиться что IP адрес в popup.js правильный

3. **Готово!** Все изменения теперь синхронизируются между участниками

## 🔧 Преимущества этого подхода

- ✅ **Простота:** Минимум кода, максимум функций
- ✅ **Приватность:** Только для твоей команды
- ✅ **Синхронизация:** Все видят изменения в реальном времени
- ✅ **Без сторонних сервисов:** Все работает на твоем ПК
- ✅ **Легкое обновление:** Просто заменить файлы расширения

## 🚀 Возможные улучшения в будущем

- Автоматическое определение IP сервера
- Уведомления о новых задачах
- История изменений
- Экспорт данных в Excel
