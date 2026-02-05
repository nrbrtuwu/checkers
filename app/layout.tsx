import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Checkers - Play Against AI',
  description: 'A clean, modern checkers game with AI opponents for all skill levels',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#141820',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased overflow-hidden`}>{children}</body>
    </html>
  )
}
