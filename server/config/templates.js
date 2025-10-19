// ========================================
// TEMPLATE LAYOUT CONFIGURATION
// Hanya 2 template: Horizontal Single & Classic 2x3
// ========================================

const templates = {
  // Template 1: Horizontal Single Photo
  'horizontal-single': {
    name: 'Horizontal Single',
    description: '1 foto besar horizontal',
    captureCount: 5,      // Ambil 5 foto
    selectCount: 1,       // Pilih 1 foto terbaik
    stripWidth: 1800,     // 6 inch x 300 dpi
    stripHeight: 1200,    // 4 inch x 300 dpi
    hasFrame: true,
    layout: [
      // 1 foto besar - landscape orientation
      { 
        width: 1700,      // Hampir full width dengan padding
        height: 1100,     // Hampir full height dengan padding
        left: 50,         // Padding kiri
        top: 50,          // Padding atas
        aspectRatio: '16:9' // Landscape
      }
    ],
    frameSize: {
      // Ukuran frame yang harus dibuat
      width: 1800,
      height: 1200,
      description: 'Frame horizontal 6x4 inch @ 300dpi',
      orientation: 'landscape'
    }
  },

  // Template 2: Classic 2x3 (6 Photos)
  'classic-2x3': {
    name: 'Classic 2x3',
    description: '6 foto layout 2 kolom x 3 baris',
    captureCount: 8,      // Ambil 8 foto
    selectCount: 6,       // Pilih 6 foto terbaik
    stripWidth: 1200,     // 4 inch x 300 dpi
    stripHeight: 1800,    // 6 inch x 300 dpi
    hasFrame: true,
    layout: [
      // Layout 2 kolom x 3 baris dengan rasio 4:3
      { 
        width: 560, 
        height: 420,      // Rasio 4:3 (landscape)
        left: 30, 
        top: 40,
        aspectRatio: '4:3'
      },
      { 
        width: 560, 
        height: 420, 
        left: 610, 
        top: 40,
        aspectRatio: '4:3'
      },
      { 
        width: 560, 
        height: 420, 
        left: 30, 
        top: 490,
        aspectRatio: '4:3'
      },
      { 
        width: 560, 
        height: 420, 
        left: 610, 
        top: 490,
        aspectRatio: '4:3'
      },
      { 
        width: 560, 
        height: 420, 
        left: 30, 
        top: 940,
        aspectRatio: '4:3'
      },
      { 
        width: 560, 
        height: 420, 
        left: 610, 
        top: 940,
        aspectRatio: '4:3'
      }
    ],
    frameSize: {
      // Ukuran frame yang harus dibuat
      width: 1200,
      height: 1800,
      description: 'Frame vertical 4x6 inch @ 300dpi',
      orientation: 'portrait'
    }
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get template by ID
 */
function getTemplate(templateId) {
  return templates[templateId] || templates['classic-2x3'];
}

/**
 * Get all available templates
 */
function getAllTemplates() {
  return Object.keys(templates).map(id => ({
    id,
    name: templates[id].name,
    description: templates[id].description,
    captureCount: templates[id].captureCount,
    selectCount: templates[id].selectCount,
    frameSize: templates[id].frameSize
  }));
}

/**
 * Validate if enough photos for template
 */
function validatePhotosForTemplate(templateId, photoCount) {
  const template = getTemplate(templateId);
  return photoCount >= template.selectCount;
}

/**
 * Get aspect ratio as number (width/height)
 */
function getAspectRatioValue(aspectRatio) {
  if (!aspectRatio) return 1;
  const [w, h] = aspectRatio.split(':').map(Number);
  return w / h;
}

module.exports = {
  templates,
  getTemplate,
  getAllTemplates,
  validatePhotosForTemplate,
  getAspectRatioValue
};