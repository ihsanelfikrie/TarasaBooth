import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SelectPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State untuk requiredPhotos - akan di-update dari template
  const [requiredPhotos, setRequiredPhotos] = useState(6)
  const [maxPhotos, setMaxPhotos] = useState(6)

  // ========================================
  // AMBIL FOTO DARI SESSION STORAGE
  // ========================================
  useEffect(() => {
    const capturedData = sessionStorage.getItem('capturedPhotos')
    const templateData = sessionStorage.getItem('selectedTemplate')
    
    if (!capturedData || !templateData) {
      alert('Tidak ada foto yang tersedia. Silakan ambil foto terlebih dahulu!')
      router.push('/capture')
      return
    }
    
    const parsedTemplate = JSON.parse(templateData)
    setSelectedTemplate(parsedTemplate)
    
    const parsedPhotos = JSON.parse(capturedData)
    setPhotos(parsedPhotos)
    
    // Auto-select photos sesuai selectCount
    const selectCount = parsedTemplate.selectCount || 6
    console.log(`📊 Template: ${parsedTemplate.name}, Select count: ${selectCount}`)
    
    if (parsedPhotos.length >= selectCount) {
      const autoSelected = parsedPhotos.slice(0, selectCount).map((_, index) => index)
      setSelectedPhotos(autoSelected)
      console.log(`✅ Auto-selected ${autoSelected.length} photos:`, autoSelected)
    }
    
    console.log(`✅ Template requires ${selectCount} photos from ${parsedPhotos.length} available`)
  }, [router])

  // ========================================
  // TOGGLE PILIH/UNPILIH FOTO
  // ========================================
  const togglePhotoSelection = (index) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(index)) {
        // Unpilih foto
        return prev.filter(i => i !== index)
      } else {
        // Pilih foto (maksimal 6)
        if (prev.length >= maxPhotos) {
          alert(`Anda hanya bisa memilih maksimal ${maxPhotos} foto!`)
          return prev
        }
        return [...prev, index]
      }
    })
  }

  // ========================================
  // LANJUT KE PROSES (KIRIM KE BACKEND)
  // ========================================
  const processPhotos = async () => {
    if (selectedPhotos.length !== requiredPhotos) {
      alert(`Silakan pilih tepat ${requiredPhotos} foto!`)
      return
    }

    setIsProcessing(true)

    // Ambil foto yang dipilih
    const selectedPhotoData = selectedPhotos
      .sort((a, b) => a - b) // Urutkan berdasarkan index
      .map(index => photos[index])

    // Ambil data frame dan background
    const frameData = JSON.parse(sessionStorage.getItem('selectedFrame'))
    const bgData = JSON.parse(sessionStorage.getItem('selectedBackground'))
    const templateData = JSON.parse(sessionStorage.getItem('selectedTemplate'))

    try {
      // Kirim ke backend untuk diproses
      const response = await fetch('http://localhost:3001/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: selectedPhotoData,
          frame: frameData.id,
          background: bgData.id,
          template: templateData.id  // Kirim template ID
        })
      })

      if (!response.ok) {
        throw new Error('Gagal memproses foto')
      }

      const result = await response.json()

      // Simpan hasil ke sessionStorage
      sessionStorage.setItem('processResult', JSON.stringify(result))

      // Redirect ke halaman hasil
      router.push('/result')

    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat memproses foto. Untuk demo, kita lanjut ke hasil.')
      
      // Untuk demo, kita tetap lanjut dengan data dummy
      const dummyResult = {
        photostrip: '/static/outputs/photostrip-demo.jpg',
        video: '/static/outputs/slideshow-demo.mp4',
        qrCode: 'data:image/png;base64,demo'
      }
      sessionStorage.setItem('processResult', JSON.stringify(dummyResult))
      router.push('/result')
    }
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Pilih Foto Terbaik</title>
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
                Langkah 4 dari 4
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
              Pilih {requiredPhotos} Foto Terbaik
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)', marginBottom: '1rem' }}>
              Klik pada foto untuk memilih atau membatalkan pilihan
            </p>
            {selectedTemplate && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-primary)', fontWeight: '500' }}>
                Template: {selectedTemplate.name}
              </p>
            )}
            
            {/* Counter */}
            <div style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: selectedPhotos.length === requiredPhotos 
                ? 'rgba(76, 175, 80, 0.1)' 
                : 'rgba(255, 152, 0, 0.1)',
              borderRadius: '9999px',
              border: `2px solid ${selectedPhotos.length === requiredPhotos ? '#4CAF50' : '#FF9800'}`
            }}>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: selectedPhotos.length === requiredPhotos ? '#4CAF50' : '#FF9800'
              }}>
                {selectedPhotos.length} / {requiredPhotos} foto dipilih
              </span>
            </div>
          </div>

          {/* Grid Foto */}
          {photos.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                {photos.map((photo, index) => {
                  const isSelected = selectedPhotos.includes(index)
                  const selectionOrder = selectedPhotos.indexOf(index) + 1
                  
                  return (
                    <div
                      key={index}
                      onClick={() => togglePhotoSelection(index)}
                      className="hover-scale cursor-pointer"
                      style={{
                        position: 'relative',
                        aspectRatio: '4/3',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        border: isSelected 
                          ? '4px solid var(--color-accent-primary)' 
                          : '2px solid #e5e7eb',
                        boxShadow: isSelected
                          ? '0 10px 25px -5px rgb(0 0 0 / 0.2)'
                          : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        opacity: isSelected ? 1 : 0.7,
                        transform: isSelected ? 'scale(1)' : 'scale(0.98)'
                      }}
                    >
                      {/* Gambar */}
                      <img 
                        src={photo} 
                        alt={`Foto ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          userSelect: 'none'
                        }}
                      />

                      {/* Overlay saat dipilih */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(200, 160, 120, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: 'var(--color-accent-primary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgb(0 0 0 / 0.3)',
                            animation: 'scale-in 0.3s ease'
                          }}>
                            <svg style={{ width: '36px', height: '36px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Nomor urutan */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          width: '36px',
                          height: '36px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '1.125rem',
                          color: 'var(--color-accent-primary)',
                          boxShadow: '0 2px 8px rgb(0 0 0 / 0.2)'
                        }}>
                          {selectionOrder}
                        </div>
                      )}

                      {/* Label nomor foto */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        left: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        #{index + 1}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-center gap-4 flex-wrap">
                {/* Tombol Kembali */}
                <button
                  onClick={() => router.push('/capture')}
                  disabled={isProcessing}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    color: 'var(--color-accent-primary)',
                    border: '2px solid var(--color-accent-primary)',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.5 : 1,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.target.style.backgroundColor = 'var(--color-cream-light)'
                      e.target.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.transform = 'scale(1)'
                    }
                  }}
                >
                  ← Kembali
                </button>

                {/* Tombol Proses */}
                <button
                  onClick={processPhotos}
                  disabled={selectedPhotos.length !== requiredPhotos || isProcessing}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: (selectedPhotos.length === requiredPhotos && !isProcessing) ? 'pointer' : 'not-allowed',
                    backgroundColor: (selectedPhotos.length === requiredPhotos && !isProcessing) 
                      ? 'var(--color-accent-primary)' 
                      : '#d1d5db',
                    color: (selectedPhotos.length === requiredPhotos && !isProcessing) ? 'white' : '#6b7280',
                    opacity: (selectedPhotos.length === requiredPhotos && !isProcessing) ? 1 : 0.6,
                    boxShadow: (selectedPhotos.length === requiredPhotos && !isProcessing) 
                      ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPhotos.length === requiredPhotos && !isProcessing) {
                      e.target.style.backgroundColor = 'var(--color-accent-hover)'
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPhotos.length === requiredPhotos && !isProcessing) {
                      e.target.style.backgroundColor = 'var(--color-accent-primary)'
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div 
                        className="animate-spin"
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid transparent',
                          borderTopColor: 'white',
                          borderRadius: '50%'
                        }}
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      {selectedPhotos.length === requiredPhotos ? '✨ Proses Foto →' : `Pilih ${requiredPhotos} Foto`}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}