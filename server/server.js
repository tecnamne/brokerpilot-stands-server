const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'stands.json'));
const middlewares = jsonServer.defaults({
  noCors: true // Отключаем встроенный CORS
});

// Настройка CORS для работы с расширением
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware по умолчанию
server.use(middlewares);

// Health check endpoint для предотвращения засыпания
server.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Root endpoint
server.get('/', (req, res) => {
  res.json({
    message: 'BrokerPilot Stands Server',
    version: '1.0.0',
    endpoints: {
      stands: '/stands',
      completedTasks: '/completedTasks',
      health: '/health'
    }
  });
});

// Маршруты API
server.use(router);

// Порт для Railway (автоматически присваивается)
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 BrokerPilot Stands Server is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📋 Stands API: http://localhost:${PORT}/stands`);
  console.log(`✅ Completed Tasks: http://localhost:${PORT}/completedTasks`);
  console.log(`💓 Health Check: http://localhost:${PORT}/health`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚂 Platform: ${process.env.RAILWAY_ENVIRONMENT || 'local'}`);
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
