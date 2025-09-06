const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables');
  console.error('Please create a backend/.env file with JWT_SECRET=your_secret_key');
  process.exit(1);
}

// Initialize database
const { sequelize } = require('./config/database');
const { initializeModels } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const responseRoutes = require('./routes/responses');
const formRoutes = require('./routes/forms');
const contactRoutes = require('./routes/contacts');
const entityRoutes = require('./routes/entities');
const profileRoutes = require('./routes/profile');
const configRoutes = require('./routes/config');
const affiliateRoutes = require('./routes/affiliate');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/config', configRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize models
    initializeModels();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 NPS Backend API ready`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();