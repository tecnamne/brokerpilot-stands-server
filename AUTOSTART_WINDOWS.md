# 🚀 Автозапуск Stands Manager на Windows

## Способ 1: Автозагрузка через планировщик задач

### 1. Создать улучшенный bat-файл
Создай файл `autostart-server.bat`:

```batch
@echo off
title BrokerPilot Stands Server - Autostart
cd /d "C:\games\Proect\Standcontrol\server"

:restart
echo ========================================
echo BrokerPilot Stands Server - Autostart
echo ========================================
echo Starting at: %date% %time%
echo.

REM Проверка что Node.js установлен
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

REM Проверка что JSON Server установлен  
where json-server >nul 2>nul
if errorlevel 1 (
    echo Installing JSON Server...
    npm install -g json-server
)

REM Запуск сервера
echo Starting JSON Server...
json-server stands.json --port 3001 --host 0.0.0.0

REM Если сервер упал - перезапускаем через 5 секунд
echo.
echo Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto restart
```

### 2. Добавить в автозагрузку Windows

#### Через планировщик задач (рекомендуется):
1. Win + R → `taskschd.msc`
2. Действия → Создать задачу
3. **Общие:**
   - Имя: `BrokerPilot Stands Server`
   - Выполнять независимо от входа пользователя в систему ✓
   - Выполнять с наивысшими правами ✓
4. **Триггеры:** При запуске
5. **Действия:** Запустить программу
   - Программа: `C:\games\Proect\Standcontrol\server\autostart-server.bat`
6. **Параметры:** 
   - Разрешить выполнение задачи по требованию ✓
   - Если задача не удалась, перезапускать каждые: 1 минута

#### Через автозагрузку пользователя (проще):
1. Win + R → `shell:startup`
2. Скопировать туда `autostart-server.bat`

### 3. Настройка Windows для 24/7 работы

#### Отключить режим сна:
```powershell
# Запустить PowerShell как администратор
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
```

#### Автоматический перезапуск после сбоев питания:
1. BIOS → Power Management → AC Power Recovery → Power On
2. Windows: Панель управления → Система → Дополнительные параметры → Загрузка и восстановление → Автоматически выполнить перезагрузку ✓

#### Автоматический вход в Windows:
1. Win + R → `netplwiz`
2. Снять галочку "Требовать ввод имени пользователя и пароля"
3. Указать пользователя для автовхода

## Способ 2: Windows Service (продвинутый)

Создать Windows службу с помощью Node.js:

### 1. Установить node-windows:
```bash
npm install -g node-windows
```

### 2. Создать service-installer.js:
```javascript
const Service = require('node-windows').Service;

// Создать объект службы
const svc = new Service({
  name: 'BrokerPilot Stands Server',
  description: 'BrokerPilot тестовые стенды API сервер',
  script: 'C:\\games\\Proect\\Standcontrol\\server\\service.js'
});

// Обработчики событий
svc.on('install', () => {
  console.log('Служба установлена!');
  svc.start();
});

svc.on('start', () => {
  console.log('Служба запущена!');
});

// Установить службу
svc.install();
```

### 3. Создать service.js:
```javascript
const { exec } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'stands.json');

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting JSON Server...`);
  
  const server = exec('json-server stands.json --port 3001 --host 0.0.0.0', {
    cwd: __dirname
  });
  
  server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });
  
  server.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] Server stopped with code ${code}`);
    console.log('Restarting in 5 seconds...');
    setTimeout(startServer, 5000);
  });
}

// Запуск
startServer();
```

### 4. Установить службу:
```bash
node service-installer.js
```

## 🔧 Мониторинг и логирование

### Создать monitor.bat для проверки:
```batch
@echo off
echo Checking BrokerPilot Stands Server...
curl http://localhost:3001/stands
if errorlevel 1 (
    echo Server is DOWN! Restarting...
    taskkill /f /im node.exe
    start "" "C:\games\Proect\Standcontrol\server\autostart-server.bat"
) else (
    echo Server is UP and running!
)
```

### Добавить в планировщик для проверки каждые 5 минут

## ✅ Рекомендуемая настройка:

1. **Использовать планировщик задач** с `autostart-server.bat`
2. **Настроить автозапуск** при включении ПК
3. **Отключить режим сна** компьютера
4. **Настроить автовход** в Windows
5. **Добавить мониторинг** каждые 5 минут

Это даст тебе надежный 24/7 сервер на обычном ПК!
