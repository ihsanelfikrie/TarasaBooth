import '@/styles/globals.css'
import { Poppins } from 'next/font/google'

// Setup font Poppins dari Google Fonts
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  )
}