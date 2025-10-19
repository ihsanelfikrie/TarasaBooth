const express = require('express');
const router = express.Router();
const { processPhotos } = require('../controllers/processController');

// ========================================
// POST /api/process
// Endpoint untuk memproses 6 foto
// ========================================
router.post('/process', processPhotos);

// ========================================
// GET /api/test
// Test endpoint untuk cek API berfungsi
// ========================================
router.get('/test', (req, res) => {
  res.json({
    message: 'API Route is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;