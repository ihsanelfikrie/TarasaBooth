const sharp = require('sharp');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { getTemplate } = require('../config/templates');

// ========================================
// FUNGSI UTAMA: PROCESS PHOTOS DENGAN TEMPLATE
// ========================================
async function processPhotos(req, res) {
  try {
    console.log('📸 Processing photos started...');
    
    const { photos, frame, background, template: templateId = 'classic-2x3', logo } = req.body;

    // Get template configuration
    const template = getTemplate(templateId);
    console.log(`📐 Using template: ${template.name}`);

    // Validasi jumlah foto
    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ 
        error: 'Photos harus berupa array' 
      });
    }

    if (photos.length < template.photoCount) {
      return res.status(400).json({ 
        error: `Template ${template.name} memerlukan ${template.photoCount} foto, tetapi hanya ${photos.length} foto yang dikirim` 
      });
    }

    console.log(`✅ Received ${photos.length} photos to process`);
    console.log(`📦 Frame: ${frame || 'none'}`);
    console.log(`🎨 Background: ${background || 'none'}`);

    // ========================================
    // STEP 1: Convert base64 to buffers
    // ========================================
    const photoBuffers = photos.slice(0, template.photoCount).map((photo, index) => {
      try {
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error(`❌ Error converting photo ${index}:`, error.message);
        throw new Error(`Failed to convert photo ${index + 1}`);
      }
    });

    console.log(`✅ Converted ${photoBuffers.length} photos to buffers`);

    // ========================================
    // STEP 2: Create canvas dengan ukuran template
    // ========================================
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '..', 'public', 'outputs');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `photostrip-${timestamp}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);

    console.log(`📐 Canvas size: ${template.stripWidth}x${template.stripHeight}px`);

    // Buat canvas putih
    let canvas = await sharp({
      create: {
        width: template.stripWidth,
        height: template.stripHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).jpeg().toBuffer();

    // ========================================
    // STEP 3: Resize dan composite semua foto sesuai layout template
    // ========================================
    const compositeArray = [];

    for (let i = 0; i < template.selectCount; i++) {
      const layout = template.layout[i];
      
      try {
        // Resize foto sesuai layout dengan aspect ratio yang benar
        const resized = await sharp(photoBuffers[i])
          .resize(layout.width, layout.height, {
            fit: 'cover',  // Cover akan fill area tanpa distorsi
            position: 'center'
          })
          .toBuffer();
        
        compositeArray.push({
          input: resized,
          left: layout.left,
          top: layout.top
        });

        console.log(`✅ Photo ${i + 1}: ${layout.width}x${layout.height} at (${layout.left}, ${layout.top})`);
      } catch (error) {
        console.error(`❌ Error processing photo ${i}:`, error.message);
        throw error;
      }
    }

    // Composite semua foto ke canvas
    console.log(`🎨 Compositing ${compositeArray.length} photos to canvas...`);
    let finalImage = await sharp(canvas)
      .composite(compositeArray)
      .toBuffer();

    console.log('✅ All photos composited to canvas');

    // ========================================
    // STEP 4: Add logo jika template punya logoPosition
    // ========================================
    if (template.logoPosition && logo) {
      try {
        let logoBuffer;
        
        // Jika logo adalah base64
        if (logo.startsWith('data:image')) {
          const logoBase64 = logo.replace(/^data:image\/\w+;base64,/, '');
          logoBuffer = Buffer.from(logoBase64, 'base64');
        } else {
          // Jika logo adalah file path
          const logoPath = path.join(__dirname, '..', 'public', logo);
          if (fs.existsSync(logoPath)) {
            logoBuffer = fs.readFileSync(logoPath);
          }
        }

        if (logoBuffer) {
          const resizedLogo = await sharp(logoBuffer)
            .resize(template.logoPosition.width, template.logoPosition.height, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toBuffer();

          finalImage = await sharp(finalImage)
            .composite([{
              input: resizedLogo,
              left: template.logoPosition.left,
              top: template.logoPosition.top
            }])
            .toBuffer();

          console.log('✅ Logo added');
        }
      } catch (logoError) {
        console.log('⚠️ Logo processing skipped:', logoError.message);
      }
    }

    // ========================================
    // STEP 5: Apply frame overlay (optional)
    // ========================================
    if (frame && template.hasFrame) {
      try {
        const framesDir = path.join(__dirname, '..', 'public', 'frames');
        const framePath = path.join(framesDir, `${frame}.png`);

        if (fs.existsSync(framePath)) {
          const frameBuffer = await sharp(framePath)
            .resize(template.stripWidth, template.stripHeight, { fit: 'fill' })
            .toBuffer();

          finalImage = await sharp(finalImage)
            .composite([{
              input: frameBuffer,
              blend: 'over'
            }])
            .toBuffer();

          console.log('✅ Frame overlay applied');
        }
      } catch (frameError) {
        console.log('⚠️ Frame overlay skipped:', frameError.message);
      }
    }

    // ========================================
    // STEP 6: Save final image
    // ========================================
    await sharp(finalImage)
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    console.log(`✅ Photo strip saved: ${outputPath}`);

    // ========================================
    // STEP 7: Generate QR Code
    // ========================================
    const photostripUrl = `http://localhost:3001/static/outputs/${outputFilename}`;
    
    let qrCodeDataUrl;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(photostripUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('✅ QR Code generated');
    } catch (qrError) {
      console.error('❌ QR Code generation failed:', qrError.message);
      qrCodeDataUrl = null;
    }

    // ========================================
    // STEP 8: Return hasil
    // ========================================
    const result = {
      success: true,
      photostrip: `/static/outputs/${outputFilename}`,
      photostripUrl: photostripUrl,
      qrCode: qrCodeDataUrl,
      timestamp: timestamp,
      template: {
        id: templateId,
        name: template.name
      }
    };

    console.log('🎉 Processing completed successfully!');
    res.json(result);

  } catch (error) {
    console.error('❌ Error processing photos:', error);
    res.status(500).json({ 
      error: 'Gagal memproses foto',
      details: error.message 
    });
  }
}

module.exports = {
  processPhotos
};