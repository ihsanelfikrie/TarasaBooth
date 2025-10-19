const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getAllTemplates } = require('../config/templates');

// ========================================
// GET LIST FRAMES
// ========================================
router.get('/frames', (req, res) => {
  try {
    const framesDir = path.join(__dirname, '..', 'public', 'frames');
    
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const files = fs.readdirSync(framesDir);
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg'].includes(ext);
    });

    const frames = imageFiles.map(file => {
      const name = path.basename(file, path.extname(file))
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        id: file.replace(/\.[^/.]+$/, ""),
        name: name,
        url: `/static/frames/${file}`
      };
    });

    console.log(`✅ Found ${frames.length} frames`);
    res.json(frames);

  } catch (error) {
    console.error('❌ Error reading frames:', error);
    res.status(500).json({ error: 'Failed to read frames' });
  }
});

// ========================================
// GET LIST BACKGROUNDS
// ========================================
router.get('/backgrounds', (req, res) => {
  try {
    const backgroundsDir = path.join(__dirname, '..', 'public', 'backgrounds');
    
    if (!fs.existsSync(backgroundsDir)) {
      fs.mkdirSync(backgroundsDir, { recursive: true });
    }

    const files = fs.readdirSync(backgroundsDir);
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg'].includes(ext);
    });

    const backgrounds = imageFiles.map(file => {
      const name = path.basename(file, path.extname(file))
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        id: file.replace(/\.[^/.]+$/, ""),
        name: name,
        url: `/static/backgrounds/${file}`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
    });

    console.log(`✅ Found ${backgrounds.length} backgrounds`);
    res.json(backgrounds);

  } catch (error) {
    console.error('❌ Error reading backgrounds:', error);
    res.status(500).json({ error: 'Failed to read backgrounds' });
  }
});

// ========================================
// GET LIST TEMPLATES (BARU)
// ========================================
router.get('/templates', (req, res) => {
  try {
    const templates = getAllTemplates();
    console.log(`✅ Found ${templates.length} templates`);
    res.json(templates);
  } catch (error) {
    console.error('❌ Error reading templates:', error);
    res.status(500).json({ error: 'Failed to read templates' });
  }
});

module.exports = router;