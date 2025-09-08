#!/bin/bash

# BrokerPilot Stands Server Deployment Script
# Этот скрипт автоматически настроит сервер на Ubuntu

set -e

echo "🚀 Начинаем развертывание BrokerPilot Stands Server..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18.x
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версий
echo "✅ Версии установленного ПО:"
node --version
npm --version

# Создание пользователя для приложения
echo "👤 Создание пользователя brokerpilot..."
sudo useradd -m -s /bin/bash brokerpilot || echo "Пользователь уже существует"

# Создание директории приложения
echo "📁 Создание директории приложения..."
sudo mkdir -p /opt/brokerpilot
sudo chown brokerpilot:brokerpilot /opt/brokerpilot

# Переход в директорию
cd /opt/brokerpilot

# Создание package.json
echo "📝 Создание package.json..."
cat > package.json << 'EOF'
{
  "name": "brokerpilot-stands-server",
  "version": "1.0.0",
  "description": "BrokerPilot Stands Management Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "json-server stands.json --port 3001 --host 0.0.0.0"
  },
  "dependencies": {
    "json-server": "^1.0.0-beta.3",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Создание server.js
echo "📝 Создание server.js..."
cat > server.js << 'EOF'
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'stands.json'));
const middlewares = jsonServer.defaults();

// Настройка CORS для работы с расширением
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware по умолчанию
server.use(middlewares);

// Маршруты
server.use('/api', router);
server.use(router);

// Порт из переменной окружения или 3001
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 BrokerPilot Stands Server is running!`);
  console.log(`📡 Server: http://${HOST}:${PORT}`);
  console.log(`📋 Stands API: http://${HOST}:${PORT}/stands`);
  console.log(`✅ Completed Tasks: http://${HOST}:${PORT}/completedTasks`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});
EOF

# Создание базового stands.json
echo "📝 Создание stands.json..."
cat > stands.json << 'EOF'
{
  "stands": [
    {
      "id": "develop1",
      "name": "Develop1",
      "description": "Основной тестовый стенд",
      "nodes": [
        "DemoMT5",
        "MT5Indigosoft",
        "Second",
        "SuperNode"
      ],
      "tasks": [],
      "taskData": {},
      "blocked": false,
      "blockReason": "",
      "blockDate": "",
      "status": "free"
    },
    {
      "id": "develop2",
      "name": "Develop2",
      "description": "Стабилизационный стенд",
      "nodes": [
        "SuperNode"
      ],
      "tasks": [],
      "taskData": {},
      "blocked": false,
      "blockReason": "",
      "blockDate": "",
      "status": "free"
    },
    {
      "id": "develop3",
      "name": "Develop3",
      "description": "Производительность и нагрузка",
      "nodes": [
        "SuperNode"
      ],
      "tasks": [],
      "taskData": {},
      "blocked": false,
      "blockReason": "",
      "blockDate": "",
      "status": "free"
    },
    {
      "id": "develop4",
      "name": "Develop4",
      "description": "Полный функционал",
      "nodes": [
        "CT_Indigosoft",
        "CT_Test",
        "MT4dev",
        "MT5dev",
        "MT5Indigosoft",
        "SuperNode",
        "HedgeNode"
      ],
      "tasks": [],
      "taskData": {},
      "blocked": false,
      "blockReason": "",
      "blockDate": "",
      "status": "free"
    }
  ],
  "completedTasks": []
}
EOF

# Установка зависимостей
echo "📦 Установка зависимостей..."
sudo -u brokerpilot npm install

# Настройка прав доступа
sudo chown -R brokerpilot:brokerpilot /opt/brokerpilot
sudo chmod +x /opt/brokerpilot/server.js

# Создание systemd сервиса
echo "⚙️ Создание systemd сервиса..."
sudo tee /etc/systemd/system/brokerpilot.service > /dev/null << 'EOF'
[Unit]
Description=BrokerPilot Stands Server
After=network.target

[Service]
Type=simple
User=brokerpilot
WorkingDirectory=/opt/brokerpilot
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=0.0.0.0

# Ограничения ресурсов
MemoryHigh=256M
MemoryMax=512M

# Логирование
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузка systemd и запуск сервиса
echo "🔄 Запуск сервиса..."
sudo systemctl daemon-reload
sudo systemctl enable brokerpilot
sudo systemctl start brokerpilot

# Проверка статуса
echo "✅ Проверка статуса сервиса..."
sudo systemctl status brokerpilot

# Настройка ufw firewall
echo "🔒 Настройка firewall..."
sudo ufw allow ssh
sudo ufw allow 3001
sudo ufw --force enable

# Получение публичного IP
echo "🌐 Получение публичного IP адреса..."
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com/)

echo ""
echo "🎉 Развертывание завершено!"
echo "📡 Сервер доступен по адресу: http://$PUBLIC_IP:3001"
echo "📋 API стендов: http://$PUBLIC_IP:3001/stands"
echo "✅ Завершенные задачи: http://$PUBLIC_IP:3001/completedTasks"
echo ""
echo "🔧 Полезные команды:"
echo "  sudo systemctl status brokerpilot   # статус сервиса"
echo "  sudo systemctl restart brokerpilot  # перезапуск"
echo "  sudo journalctl -u brokerpilot -f   # логи в реальном времени"
echo "  sudo nano /opt/brokerpilot/stands.json  # редактирование данных"
echo ""
echo "🔗 Теперь обновите IP адрес в расширении на: $PUBLIC_IP"
