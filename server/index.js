const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Untuk base64 foto yang besar
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========================================
// PASTIKAN FOLDER PUBLIC ADA
// ========================================
const publicDir = path.join(__dirname, 'public');
const framesDir = path.join(publicDir, 'frames');
const backgroundsDir = path.join(publicDir, 'backgrounds');
const outputsDir = path.join(publicDir, 'outputs');

// Buat folder jika belum ada
[publicDir, framesDir, backgroundsDir, outputsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// ========================================
// MENYAJIKAN FILE STATIS
// ========================================
app.use('/static', express.static(path.join(__dirname, 'public')));

// ========================================
// IMPORT ROUTES
// ========================================
const assetsRoutes = require('./routes/assets');
const apiRoutes = require('./routes/api');

app.use('/api/assets', assetsRoutes);
app.use('/api', apiRoutes);

// ========================================
// ROOT ENDPOINT
// ========================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server TarasaBooth berjalan dengan baik!',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      frames: '/api/assets/frames',
      backgrounds: '/api/assets/backgrounds',
      process: 'POST /api/process',
      test: '/api/test',
      static: '/static'
    }
  });
});

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ========================================
// MENJALANKAN SERVER
// ========================================
app.listen(PORT, () => {
  console.log('==============================================');
  console.log(`✅ Server TarasaBooth berhasil berjalan!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📁 File statis: http://localhost:${PORT}/static`);
  console.log(`🖼️  API Frames: http://localhost:${PORT}/api/assets/frames`);
  console.log(`🎨 API Backgrounds: http://localhost:${PORT}/api/assets/backgrounds`);
  console.log(`⚙️  API Process: POST http://localhost:${PORT}/api/process`);
  console.log('==============================================');
});