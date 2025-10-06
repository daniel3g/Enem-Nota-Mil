import './globals.css'
import { Open_Sans, Raleway } from 'next/font/google'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata = {
  title: 'Seu App',
  description: 'Descrição...',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${openSans.variable} ${raleway.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}