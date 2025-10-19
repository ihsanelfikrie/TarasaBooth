import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect ke halaman template
    router.push('/template')
  }, [router])

  return (
    <>
      <Head>
        <title>TarasaBooth</title>
      </Head>

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
    </>
  )
}