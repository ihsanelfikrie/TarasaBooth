import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Import CameraView dengan dynamic untuk avoid SSR issues
const CameraView = dynamic(() => import('../components/CameraView'), { ssr: false })

export default function CapturePage() {
  const router = useRouter()
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [photoCount, setPhotoCount] = useState(0)
  const [currentStep, setCurrentStep] = useState('ready')
  
  const countdownIntervalRef = useRef(null)
  const captureTimeoutRef = useRef(null)
  const nextPhotoTimeoutRef = useRef(null)
  
  // Ambil totalPhotos dari template
  const totalPhotos = selectedTemplate?.captureCount || 8

  // ========================================
  // CLEANUP SEMUA TIMERS
  // ========================================
  const cleanupTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current)
      captureTimeoutRef.current = null
    }
    if (nextPhotoTimeoutRef.current) {
      clearTimeout(nextPhotoTimeoutRef.current)
      nextPhotoTimeoutRef.current = null
    }
  }

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      cleanupTimers()
    }
  }, [])

  // ========================================
  // CEK DATA DARI HALAMAN SEBELUMNYA
  // ========================================
  useEffect(() => {
    const frameData = sessionStorage.getItem('selectedFrame')
    const bgData = sessionStorage.getItem('selectedBackground')
    const templateData = sessionStorage.getItem('selectedTemplate')
    
    if (!frameData || !bgData || !templateData) {
      alert('Silakan pilih template, bingkai dan latar belakang terlebih dahulu!')
      router.push('/')
      return
    }
    
    setSelectedFrame(JSON.parse(frameData))
    setSelectedBackground(JSON.parse(bgData))
    setSelectedTemplate(JSON.parse(templateData))
    
    console.log('✅ Template loaded:', JSON.parse(templateData))
  }, [router])

  // ========================================
  // FUNGSI MULAI SESI FOTO - MANUAL MODE
  // ========================================
  const startPhotoSession = () => {
    console.log('🎬 Starting photo session - MANUAL MODE')
    cleanupTimers()
    setCurrentStep('capturing')
    setPhotoCount(0)
    setCapturedPhotos([])
    setCountdown(null)
    setIsCapturing(false)
  }

  // ========================================
  // FUNGSI AMBIL FOTO MANUAL (Dipanggil saat tombol diklik)
  // ========================================
  const takePhotoManually = () => {
    if (photoCount >= totalPhotos) {
      console.log('⚠️ Maximum photos reached')
      return
    }

    console.log(`📸 Taking photo ${photoCount + 1}/${totalPhotos}`)
    
    // Trigger capture
    setIsCapturing(true)
    
    // Reset capture flag setelah 300ms
    setTimeout(() => {
      setIsCapturing(false)
      setPhotoCount(prev => prev + 1)
      
      // Cek apakah sudah mencapai max foto
      if (photoCount + 1 >= totalPhotos) {
        console.log('✅ All photos captured!')
        setTimeout(() => {
          setCurrentStep('reviewing')
        }, 1000)
      }
    }, 300)
  }

  // ========================================
  // CALLBACK SAAT FOTO BERHASIL DIAMBIL
  // ========================================
  const handlePhotoCapture = (dataUrl) => {
    console.log('✅ Photo data received')
    setCapturedPhotos((prev) => [...prev, dataUrl])
  }

  // ========================================
  // FUNGSI LANJUT KE SELEKSI FOTO
  // ========================================
  const goToSelection = () => {
    cleanupTimers()
    sessionStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos))
    router.push('/select')
  }

  // ========================================
  // FUNGSI ULANGI SESI FOTO
  // ========================================
  const retakePhotos = () => {
    cleanupTimers()
    setCapturedPhotos([])
    setPhotoCount(0)
    setCountdown(null)
    setIsCapturing(false)
    setCurrentStep('ready')
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Sesi Foto</title>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream-light)' }} className="fade-in">
        {/* HEADER */}
        <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: 'var(--color-accent-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>T</span>
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-brown-dark)' }}>
                  TarasaBooth
                </h1>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-brown-light)', fontWeight: '500' }}>
                Langkah 3 dari 4
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          
          {/* STEP: READY */}
          {currentStep === 'ready' && selectedBackground && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
                  Siap untuk Sesi Foto?
                </h2>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)', marginBottom: '0.5rem' }}>
                  Kami akan mengambil {totalPhotos} foto dengan interval waktu
                </p>
                {selectedFrame && selectedTemplate && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)', fontWeight: '500', marginTop: '0.5rem' }}>
                    Template: {selectedTemplate.name} | Bingkai: {selectedFrame.name} | Background: {selectedBackground.name}
                    <br />
                    <span style={{ fontSize: '0.75rem' }}>
                      Akan mengambil {selectedTemplate.captureCount} foto
                    </span>
                  </div>
                )}
              </div>

              <div className="max-w-3xl mx-auto mb-8">
                <CameraView 
                  background={selectedBackground}
                  onPhotoCapture={handlePhotoCapture}
                  isCapturing={isCapturing}
                />
              </div>

              <div className="text-center">
                <button
                  onClick={startPhotoSession}
                  className="transition-smooth"
                  style={{
                    padding: '1.5rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-hover)'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-primary)'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  📸 Mulai Sesi Foto
                </button>

                <button
                  onClick={() => router.push('/background')}
                  style={{
                    marginTop: '1rem',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    padding: '0.75rem 2rem',
                    backgroundColor: 'transparent',
                    color: 'var(--color-brown-light)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  ← Kembali
                </button>
              </div>
            </div>
          )}

          {/* STEP: CAPTURING - Manual Mode */}
          {currentStep === 'capturing' && selectedBackground && (
            <div className="fade-in">
              {/* Progress Info */}
              <div className="text-center mb-6">
                <h2 style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '0.5rem' }}>
                  Foto {photoCount} dari {totalPhotos}
                </h2>
                <p style={{ fontSize: '1rem', color: 'var(--color-brown-light)', marginBottom: '1rem' }}>
                  Klik tombol di bawah untuk mengambil foto
                </p>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  margin: '1rem auto',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(photoCount / totalPhotos) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-accent-primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Camera Preview */}
              <div className="max-w-3xl mx-auto relative mb-8" style={{ position: 'relative' }}>
                <CameraView 
                  background={selectedBackground}
                  onPhotoCapture={handlePhotoCapture}
                  isCapturing={isCapturing}
                />

                {/* Flash Effect */}
                {isCapturing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    animation: 'flash 0.3s ease',
                    zIndex: 9
                  }} />
                )}
              </div>

              {/* Tombol Capture Manual */}
              <div className="text-center mb-8">
                {photoCount < totalPhotos ? (
                  <button
                    onClick={takePhotoManually}
                    disabled={isCapturing}
                    className="transition-smooth"
                    style={{
                      padding: '1.5rem 4rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: isCapturing ? 'not-allowed' : 'pointer',
                      backgroundColor: isCapturing ? '#d1d5db' : 'var(--color-accent-primary)',
                      color: 'white',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      opacity: isCapturing ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isCapturing) {
                        e.target.style.backgroundColor = 'var(--color-accent-hover)'
                        e.target.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCapturing) {
                        e.target.style.backgroundColor = 'var(--color-accent-primary)'
                        e.target.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    {isCapturing ? '⏳ Memproses...' : '📸 Ambil Foto'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep('reviewing')}
                    className="transition-smooth"
                    style={{
                      padding: '1.5rem 4rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    ✅ Selesai - Lihat Hasil
                  </button>
                )}
              </div>

              {/* Thumbnail Preview */}
              {capturedPhotos.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ 
                    textAlign: 'center', 
                    color: 'var(--color-brown-light)', 
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}>
                    Foto yang sudah diambil: {capturedPhotos.length}/{totalPhotos}
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '0.5rem',
                    maxWidth: '600px',
                    margin: '0 auto'
                  }}>
                    {capturedPhotos.map((photo, index) => (
                      <div 
                        key={index}
                        style={{
                          aspectRatio: '4/3',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          border: '2px solid var(--color-accent-primary)',
                          boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                          position: 'relative'
                        }}
                      >
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '0.25rem',
                          right: '0.25rem',
                          backgroundColor: 'var(--color-accent-primary)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '1.5rem',
                          height: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: REVIEWING */}
          {currentStep === 'reviewing' && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
                  🎉 Sesi Foto Selesai!
                </h2>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)' }}>
                  Anda telah mengambil {capturedPhotos.length} foto
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '3rem'
              }}>
                {capturedPhotos.map((photo, index) => (
                  <div 
                    key={index}
                    style={{
                      aspectRatio: '4/3',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgb(0 0 0 / 0.1)',
                      border: '3px solid white',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={photo} 
                      alt={`Foto ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={retakePhotos}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    color: 'var(--color-accent-primary)',
                    border: '2px solid var(--color-accent-primary)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-cream-light)'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  🔄 Ambil Ulang
                </button>

                <button
                  onClick={goToSelection}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-hover)'
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-primary)'
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                >
                  Lanjut ke Seleksi Foto →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  )
}