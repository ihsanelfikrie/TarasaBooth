import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resultData = sessionStorage.getItem('processResult')
    
    if (!resultData) {
      alert('Tidak ada hasil yang tersedia!')
      router.push('/')
      return
    }
    
    const parsed = JSON.parse(resultData)
    console.log('✅ Result data loaded:', parsed)
    setResult(parsed)
    setLoading(false)
  }, [router])

  // ========================================
  // FUNGSI CETAK
  // ========================================
  const handlePrint = () => {
    window.print()
  }

  // ========================================
  // FUNGSI DOWNLOAD
  // ========================================
  const handleDownload = () => {
    if (!result || !result.photostripUrl) return
    
    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = result.photostripUrl
    link.download = `tarasabooth-${result.timestamp}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ========================================
  // FUNGSI MULAI LAGI
  // ========================================
  const startOver = () => {
    sessionStorage.clear()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--color-cream-light)'
      }}>
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
    )
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Hasil Foto Anda</title>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream-light)' }} className="fade-in">
        {/* HEADER */}
        <header className="no-print" style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
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
              <div style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)', fontWeight: '600' }}>
                ✓ Selesai
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="text-center mb-12 no-print">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
              Foto Anda Sudah Siap!
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)' }}>
              Cetak atau unduh foto Anda sekarang
            </p>
          </div>

          {/* Layout 2 Kolom */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'start'
          }}
          className="result-grid"
          >
            {/* KOLOM KIRI: Photo Strip */}
            <div>
              <div 
                id="print-area"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)'
                }}
              >
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: 'var(--color-brown-dark)',
                    marginBottom: '0.5rem'
                  }}>
                    TarasaBooth
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--color-brown-light)' 
                  }}>
                    {new Date().toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Photo Strip Image */}
                {result && result.photostrip ? (
                  <div style={{
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgb(0 0 0 / 0.1)'
                  }}>
                    <img 
                      src={`http://localhost:3001${result.photostrip}`}
                      alt="Photo Strip"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Failed to load photo strip')
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    aspectRatio: '4/6',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #d1d5db'
                  }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      Foto tidak tersedia
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* KOLOM KANAN: QR Code & Actions */}
            <div className="no-print">
              {/* QR Code Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '3rem',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.875rem', 
                  fontWeight: '600', 
                  color: 'var(--color-brown-dark)',
                  marginBottom: '1rem'
                }}>
                  Unduh Foto
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'var(--color-brown-light)',
                  marginBottom: '2rem'
                }}>
                  Pindai QR code untuk mengunduh
                </p>

                {/* QR Code */}
                {result && result.qrCode ? (
                  <div style={{
                    width: '250px',
                    height: '250px',
                    margin: '0 auto 2rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgb(0 0 0 / 0.1)'
                  }}>
                    <img 
                      src={result.qrCode}
                      alt="QR Code"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '250px',
                    height: '250px',
                    margin: '0 auto 2rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      QR Code tidak tersedia
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '0.75rem',
                  border: '1px solid #4caf50'
                }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#2e7d32',
                    lineHeight: '1.5'
                  }}>
                    ✅ Foto berhasil diproses!
                    <br />
                    Pindai QR code atau klik tombol download
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Tombol Cetak */}
                <button
                  onClick={handlePrint}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 2rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-hover)'
                    e.target.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-accent-primary)'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  🖨️ Cetak Foto
                </button>

                {/* Tombol Download */}
                <button
                  onClick={handleDownload}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 2rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: '2px solid var(--color-accent-primary)',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: 'var(--color-accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-cream-light)'
                    e.target.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  📥 Download Foto
                </button>

                {/* Tombol Mulai Lagi */}
                <button
                  onClick={startOver}
                  className="transition-smooth"
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: 'var(--color-brown-light)',
                    marginTop: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--color-brown-dark)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--color-brown-light)'
                  }}
                >
                  🔄 Mulai Sesi Baru
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CSS untuk Print */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .result-grid {
            grid-template-columns: 1fr !important;
          }
          
          #print-area {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}