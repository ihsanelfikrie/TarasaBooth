import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function FramesPage() {
  const router = useRouter()
  const [frames, setFrames] = useState([])
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Cek apakah sudah pilih template
    const templateData = sessionStorage.getItem('selectedTemplate')
    
    if (!templateData) {
      alert('Silakan pilih template terlebih dahulu!')
      router.push('/template')
      return
    }
    
    setSelectedTemplate(JSON.parse(templateData))
    console.log('✅ Frames page loaded')
    fetchFrames()
  }, [router])

  const fetchFrames = async () => {
    try {
      console.log('🔄 Fetching frames from API...')
      const response = await fetch('http://localhost:3001/api/assets/frames')
      
      if (!response.ok) {
        throw new Error('Failed to fetch frames')
      }

      const data = await response.json()
      console.log('✅ Frames loaded:', data)
      
      if (data.length === 0) {
        setError('Tidak ada bingkai tersedia. Silakan tambahkan file .png ke folder server/public/frames/')
      } else {
        setFrames(data)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching frames:', err)
      setError('Gagal memuat bingkai. Pastikan server berjalan di port 3001.')
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!selectedFrame) {
      alert('Silakan pilih bingkai terlebih dahulu!')
      return
    }
    
    console.log('✅ Selected frame:', selectedFrame)
    sessionStorage.setItem('selectedFrame', JSON.stringify(selectedFrame))
    console.log('✅ Navigating to background page...')
    router.push('/background')
  }

  const handleBack = () => {
    router.push('/template')
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Pilih Bingkai</title>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream-light)' }} className="fade-in">
        <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} className="sticky top-0 z-50">
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
                Langkah 2 dari 5
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
              Pilih Bingkai Favoritmu
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)' }}>
              Pilih salah satu bingkai untuk foto Anda
            </p>
            {selectedTemplate && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)', fontWeight: '500', marginTop: '0.5rem' }}>
                Template: {selectedTemplate.name}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-32">
              <div 
                className="animate-spin"
                style={{
                  width: '4rem',
                  height: '4rem',
                  border: '4px solid transparent',
                  borderTopColor: 'var(--color-accent-primary)',
                  borderRadius: '50%'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '2rem',
              backgroundColor: '#fff3cd',
              borderRadius: '1rem',
              border: '2px solid #ffc107',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#856404', marginBottom: '1rem' }}>
                {error}
              </h3>
              <button
                onClick={fetchFrames}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                🔄 Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && frames.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    onClick={() => {
                      console.log('🖱️ Clicked frame:', frame.id)
                      setSelectedFrame(frame)
                    }}
                    className="hover-scale cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      border: selectedFrame?.id === frame.id 
                        ? '4px solid var(--color-accent-primary)' 
                        : '1px solid #e5e7eb',
                      boxShadow: selectedFrame?.id === frame.id
                        ? '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    <div 
                      className="relative"
                      style={{
                        aspectRatio: '4/5',
                        background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={`http://localhost:3001${frame.url}`}
                        alt={frame.name}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          console.error('Failed to load:', frame.url)
                          e.target.style.display = 'none'
                        }}
                      />
                      
                      {selectedFrame?.id === frame.id && (
                        <div 
                          className="absolute"
                          style={{
                            top: '1rem',
                            right: '1rem',
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: 'var(--color-accent-primary)',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            animation: 'scale-in 0.3s ease-out'
                          }}
                        >
                          <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-brown-dark)' }}>
                        {frame.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBack}
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
                  ← Kembali
                </button>

                <button
                  onClick={handleNext}
                  disabled={!selectedFrame}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: selectedFrame ? 'pointer' : 'not-allowed',
                    backgroundColor: selectedFrame ? 'var(--color-accent-primary)' : '#d1d5db',
                    color: selectedFrame ? 'white' : '#6b7280',
                    opacity: selectedFrame ? '1' : '0.6',
                    boxShadow: selectedFrame ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFrame) {
                      e.target.style.backgroundColor = 'var(--color-accent-hover)'
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFrame) {
                      e.target.style.backgroundColor = 'var(--color-accent-primary)'
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }
                  }}
                >
                  {selectedFrame ? 'Lanjutkan ke Pilih Latar Belakang →' : 'Pilih Bingkai Terlebih Dahulu'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}