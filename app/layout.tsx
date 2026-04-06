import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ReduxProvider from '@/store/Provider'
import { UserProvider } from '@/context/UserContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'Office Manager',
  description: 'Multi-company office management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}