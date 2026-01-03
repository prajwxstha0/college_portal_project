const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database on startup
testConnection();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running',
    services: {
      auth: '✅',
      jobs: '✅', 
      applications: '✅',
      admin: '✅',
      profiles: '✅'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DB_NAME}`);
  console.log(`🔐 Authentication: JWT System Ready`);
  console.log(`💼 Jobs API: Ready`);
  console.log(`📋 Applications API: Ready`);
  console.log(`⚙️ Admin API: Ready`);
  console.log(`👤 Profile API: Ready`);
});