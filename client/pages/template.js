import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TemplatePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('✅ Template page loaded')
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      console.log('🔄 Fetching templates from API...')
      const response = await fetch('http://localhost:3001/api/assets/templates')
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      console.log('✅ Templates loaded:', data)
      
      setTemplates(data)
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching templates:', err)
      setError('Gagal memuat template. Pastikan server berjalan.')
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!selectedTemplate) {
      alert('Silakan pilih template terlebih dahulu!')
      return
    }
    
    console.log('✅ Selected template:', selectedTemplate)
    sessionStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate))
    router.push('/frames')
  }

  return (
    <>
      <Head>
        <title>TarasaBooth - Pilih Template</title>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream-light)' }} className="fade-in">
        {/* HEADER */}
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
                Langkah 1 dari 5
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-16">
          {/* Judul */}
          <div className="text-center mb-16">
            <h2 style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '1rem' }}>
              Pilih Layout Template
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-brown-light)' }}>
              Pilih template layout untuk photo strip Anda
            </p>
          </div>

          {/* Loading */}
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

          {/* Error */}
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
                onClick={fetchTemplates}
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

          {/* Grid Templates */}
          {!loading && !error && templates.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      console.log('🖱️ Clicked template:', template.id)
                      setSelectedTemplate(template)
                    }}
                    className="hover-scale cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      border: selectedTemplate?.id === template.id 
                        ? '4px solid var(--color-accent-primary)' 
                        : '1px solid #e5e7eb',
                      boxShadow: selectedTemplate?.id === template.id
                        ? '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    {/* Preview Area */}
                    <div 
                      style={{
                        aspectRatio: '2/3',
                        background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '1rem'
                      }}
                    >
                      {/* Ilustrasi Layout */}
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        justifyContent: 'center'
                      }}>
                        {/* Render boxes based on photo count */}
                        {Array.from({ length: Math.min(template.photoCount, 4) }).map((_, i) => (
                          <div 
                            key={i}
                            style={{
                              backgroundColor: '#d1d5db',
                              borderRadius: '0.25rem',
                              height: template.photoCount === 1 ? '80%' : 
                                     template.photoCount <= 3 ? '25%' : '20%',
                              width: '90%',
                              margin: '0 auto'
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Badge Photo Count */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {template.photoCount} Foto
                      </div>

                      {/* Checkmark */}
                      {selectedTemplate?.id === template.id && (
                        <div 
                          style={{
                            position: 'absolute',
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
                    
                    {/* Info */}
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-brown-dark)', marginBottom: '0.5rem' }}>
                        {template.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-brown-light)' }}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Lanjutkan */}
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={!selectedTemplate}
                  className="transition-smooth"
                  style={{
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                    backgroundColor: selectedTemplate ? 'var(--color-accent-primary)' : '#d1d5db',
                    color: selectedTemplate ? 'white' : '#6b7280',
                    opacity: selectedTemplate ? '1' : '0.6',
                    boxShadow: selectedTemplate ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTemplate) {
                      e.target.style.backgroundColor = 'var(--color-accent-hover)'
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTemplate) {
                      e.target.style.backgroundColor = 'var(--color-accent-primary)'
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }
                  }}
                >
                  {selectedTemplate ? 'Lanjutkan ke Pilih Bingkai →' : 'Pilih Template Terlebih Dahulu'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}