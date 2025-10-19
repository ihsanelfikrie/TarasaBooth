import { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

export default function CameraView({ 
  background, 
  onPhotoCapture, 
  isCapturing = false 
}) {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastCaptureRef = useRef(false) // Track capture state
  
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [chromaKeyEnabled, setChromaKeyEnabled] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [chromaIntensity, setChromaIntensity] = useState(50)
  const [isReady, setIsReady] = useState(false)

  // ========================================
  // KONFIGURASI KAMERA
  // ========================================
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
    deviceId: selectedDevice?.deviceId
  }

  // ========================================
  // DETEKSI SEMUA KAMERA YANG TERSEDIA
  // ========================================
  const handleDevices = useCallback((mediaDevices) => {
    const videoDevices = mediaDevices.filter(
      ({ kind }) => kind === "videoinput"
    )
    console.log('📹 Video devices found:', videoDevices.length)
    setDevices(videoDevices)
    
    if (videoDevices.length > 0 && !selectedDevice) {
      setSelectedDevice(videoDevices[0])
    }
  }, [selectedDevice])

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices)
  }, [handleDevices])

  // ========================================
  // LOAD BACKGROUND IMAGE
  // ========================================
  useEffect(() => {
    if (background && background.url) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = `http://localhost:3001${background.url}`
      img.onload = () => {
        console.log('✅ Background image loaded')
        setBackgroundImage(img)
      }
      img.onerror = () => {
        console.log('⚠️ Background image failed to load, using color')
        setBackgroundImage(null)
      }
    }
  }, [background])

  // ========================================
  // HANDLE CAPTURE - HANYA SEKALI!
  // ========================================
  useEffect(() => {
    // Jika isCapturing berubah dari false ke true
    if (isCapturing && !lastCaptureRef.current) {
      console.log('📸 Capture triggered!')
      lastCaptureRef.current = true
      
      // Ambil foto dari canvas
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95)
        
        if (onPhotoCapture) {
          onPhotoCapture(dataUrl)
        }
      }
    }
    
    // Reset flag saat isCapturing jadi false
    if (!isCapturing && lastCaptureRef.current) {
      lastCaptureRef.current = false
    }
  }, [isCapturing, onPhotoCapture])

  // ========================================
  // FUNGSI CHROMA KEY YANG DIPERBAIKI
  // ========================================
  const applyChromaKey = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current) return
    
    const video = webcamRef.current.video
    const canvas = canvasRef.current
    
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(applyChromaKey)
      return
    }

    // Set ready flag
    if (!isReady) setIsReady(true)

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    
    // Set ukuran canvas sama dengan video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    // Save context state
    ctx.save()

    // MIRROR/FLIP HORIZONTAL
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)

    // Gambar frame video ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Restore untuk manipulasi pixel
    ctx.restore()

    // Jika chroma key tidak aktif, skip processing
    if (!chromaKeyEnabled) {
      animationRef.current = requestAnimationFrame(applyChromaKey)
      return
    }

    // Ambil data pixel dari canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Parameter chroma key berdasarkan intensity slider
    const baseThreshold = 140 - (chromaIntensity * 0.4)
    const baseTolerance = 30 + (chromaIntensity * 0.5)

    const greenThreshold = {
      r: 100,
      g: baseThreshold,
      b: 100
    }
    
    const tolerance = baseTolerance

    // Siapkan background canvas jika ada image
    let bgCanvas = null
    let bgCtx = null
    let bgImageData = null

    if (backgroundImage) {
      bgCanvas = document.createElement('canvas')
      bgCanvas.width = backgroundImage.width
      bgCanvas.height = backgroundImage.height
      bgCtx = bgCanvas.getContext('2d')
      bgCtx.drawImage(backgroundImage, 0, 0)
      bgImageData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height).data
    }

    // Loop setiap pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Deteksi hijau dengan toleransi yang bisa diatur
      const isGreen = (
        g > greenThreshold.g &&
        g > r + tolerance &&
        g > b + tolerance
      )

      if (isGreen) {
        if (backgroundImage && bgImageData) {
          // Hitung posisi pixel di background (scale)
          const x = (i / 4) % canvas.width
          const y = Math.floor((i / 4) / canvas.width)
          
          const bgX = Math.floor(x * (backgroundImage.width / canvas.width))
          const bgY = Math.floor(y * (backgroundImage.height / canvas.height))
          
          const bgIndex = (bgY * backgroundImage.width + bgX) * 4
          
          if (bgIndex >= 0 && bgIndex < bgImageData.length) {
            data[i] = bgImageData[bgIndex]
            data[i + 1] = bgImageData[bgIndex + 1]
            data[i + 2] = bgImageData[bgIndex + 2]
            data[i + 3] = 255
          }
        } else if (background && background.color) {
          // Gunakan warna solid
          const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : { r: 255, g: 255, b: 255 }
          }
          
          const bgColor = hexToRgb(background.color)
          data[i] = bgColor.r
          data[i + 1] = bgColor.g
          data[i + 2] = bgColor.b
          data[i + 3] = 255
        }
      }
    }

    // Tulis kembali pixel yang sudah dimodifikasi
    ctx.putImageData(imageData, 0, 0)

    // Loop terus untuk real-time
    animationRef.current = requestAnimationFrame(applyChromaKey)
  }, [chromaKeyEnabled, background, backgroundImage, chromaIntensity, isReady])

  // ========================================
  // START/STOP CHROMA KEY LOOP
  // ========================================
  useEffect(() => {
    // Stop existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Start new animation loop
    if (webcamRef.current) {
      animationRef.current = requestAnimationFrame(applyChromaKey)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [applyChromaKey])

  // ========================================
  // RENDER UI
  // ========================================
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Status Loading */}
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '2rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <div 
            className="animate-spin"
            style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid transparent',
              borderTopColor: 'white',
              borderRadius: '50%',
              margin: '0 auto 1rem'
            }}
          />
          <p>Memuat kamera...</p>
        </div>
      )}

      {/* WEBCAM (Hidden) */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={() => {
          console.log('✅ Camera ready')
          setIsReady(true)
        }}
        onUserMediaError={(error) => {
          console.error('❌ Camera error:', error)
          alert('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.')
        }}
        style={{ 
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 1,
          height: 1
        }}
      />

      {/* CANVAS - Preview */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)',
          backgroundColor: '#000',
          display: 'block'
        }}
      />

      {/* CONTROLS */}
      <div 
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Dropdown pilih kamera */}
        {devices.length > 1 && (
          <select
            value={selectedDevice?.deviceId || ''}
            onChange={(e) => {
              const device = devices.find(d => d.deviceId === e.target.value)
              setSelectedDevice(device)
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid white',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Kamera ${index + 1}`}
              </option>
            ))}
          </select>
        )}

        {/* Toggle Chroma Key */}
        <button
          onClick={() => setChromaKeyEnabled(!chromaKeyEnabled)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: chromaKeyEnabled 
              ? 'rgba(76, 175, 80, 0.9)' 
              : 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {chromaKeyEnabled ? '✓ Green Screen ON' : '✗ Green Screen OFF'}
        </button>

        {/* Slider Intensity */}
        {chromaKeyEnabled && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem'
          }}>
            <span style={{ color: 'white', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Intensitas:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={chromaIntensity}
              onChange={(e) => setChromaIntensity(parseInt(e.target.value))}
              style={{
                width: '100px',
                cursor: 'pointer'
              }}
            />
            <span style={{ color: 'white', fontSize: '0.75rem', minWidth: '2rem' }}>
              {chromaIntensity}%
            </span>
          </div>
        )}
      </div>

      {/* INFO TEXT */}
      <div 
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: '500',
          whiteSpace: 'nowrap'
        }}
      >
        {chromaKeyEnabled ? '📹 Green Screen Aktif' : '📹 Mode Normal'}
      </div>
    </div>
  )
}