import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function BackgroundPage() {
  const router = useRouter()
  const [backgrounds, setBackgrounds] = useState([])
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const frameData = sessionStorage.getItem('selectedFrame')
    
    if (!frameData) {
      alert('Silakan pilih bingkai terlebih dahulu!')
      router.push('/')
      return
    }
    
    setSelectedFrame(JSON.parse(frameData))
    fetchBackgrounds()
  }, [router])

  const fetchBackgrounds = async () => {
    try {
      console.log('🔄 Fetching backgrounds from API...')
      const response = await fetch('http://localhost:3001/api/assets/backgrounds')
      
      if (!response.ok) {
        throw new Error('Failed to fetch backgrounds')
      }

      const data = await response.json()
      console.log('✅ Backgrounds loaded:', data)
      
      if (data.length === 0) {
        setError('Tidak ada latar belakang tersedia. Silakan tambahkan file ke folder server/public/backgrounds/')
      } else {
        setBackgrounds(data)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching backgrounds:', err)
      setError('Gagal memuat latar belakang. Pastikan server berjalan.')
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleNext = () => {
    if (!selectedBackground) {
      alert('Silakan pilih latar belakang terlebih dahulu!')
      return
    }
    
    sessionStorage.setItem('selectedBackground', JSON.stringify(selectedBackground))
    router.push('/capture')
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Pilih Latar Belakang</title>
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
                Langkah 2 dari 4
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '0.75rem' }}>
              Pilih Latar Belakang
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)', marginBottom: '0.5rem' }}>
              Pilih latar belakang untuk foto Anda
            </p>
            {selectedFrame && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)', fontWeight: '500', marginTop: '0.5rem' }}>
                Bingkai dipilih: {selectedFrame.name}
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
                onClick={fetchBackgrounds}
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

          {!loading && !error && backgrounds.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
                {backgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg)}
                    className="hover-scale cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      border: selectedBackground?.id === bg.id 
                        ? '4px solid var(--color-accent-primary)' 
                        : '1px solid #e5e7eb',
                      boxShadow: selectedBackground?.id === bg.id
                        ? '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    <div 
                      className="relative"
                      style={{
                        aspectRatio: '16/10',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Gambar Background Asli */}
                      <img 
                        src={`http://localhost:3001${bg.url}`}
                        alt={bg.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          // Jika gagal load, gunakan warna solid
                          e.target.style.display = 'none'
                          e.target.parentElement.style.backgroundColor = bg.color
                        }}
                      />
                      
                      {/* Overlay gelap */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.3) 100%)'
                      }} />
                      
                      {/* Nama Background */}
                      <span style={{ 
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        color: 'white', 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        zIndex: 1
                      }}>
                        {bg.name}
                      </span>
                      
                      {/* Checkmark */}
                      {selectedBackground?.id === bg.id && (
                        <div 
                          className="absolute"
                          style={{
                            top: '0.75rem',
                            right: '0.75rem',
                            width: '2rem',
                            height: '2rem',
                            backgroundColor: 'var(--color-accent-primary)',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            animation: 'scale-in 0.3s ease-out',
                            zIndex: 2
                          }}
                        >
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-brown-dark)' }}>
                        {bg.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
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
                    e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white'
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                >
                  ← Kembali
                </button>

                <button
                  onClick={handleNext}
                  disabled={!selectedBackground}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: selectedBackground ? 'pointer' : 'not-allowed',
                    backgroundColor: selectedBackground ? 'var(--color-accent-primary)' : '#d1d5db',
                    color: selectedBackground ? 'white' : '#6b7280',
                    opacity: selectedBackground ? '1' : '0.6',
                    boxShadow: selectedBackground ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBackground) {
                      e.target.style.backgroundColor = 'var(--color-accent-hover)'
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBackground) {
                      e.target.style.backgroundColor = 'var(--color-accent-primary)'
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }
                  }}
                >
                  {selectedBackground ? 'Mulai Foto →' : 'Pilih Latar Belakang Terlebih Dahulu'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}