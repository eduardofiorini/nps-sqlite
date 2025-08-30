import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Database } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import responseRoutes from './routes/responses';
import formRoutes from './routes/forms';
import contactRoutes from './routes/contacts';
import entityRoutes from './routes/entities';
import profileRoutes from './routes/profile';
import configRoutes from './routes/config';
import affiliateRoutes from './routes/affiliate';
import adminRoutes from './routes/admin';
import emailRoutes from './routes/email';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Initialize database
Database.getInstance();

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 NPS Backend API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await Database.getInstance().close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;