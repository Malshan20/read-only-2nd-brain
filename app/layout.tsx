import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MusicProvider } from "@/lib/music-context"
import { MiniPlayer } from "@/components/music/mini-player"
import Script from 'next/script';
import { Chatbot } from "@/components/chat-bot/chatbot"

const inter = Inter({ subsets: ["latin"] })

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID;
export const metadata: Metadata = {
  title: "Second Brain - AI Study Assistant",
  description: "AI-powered productivity and learning assistant for students",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MusicProvider>
            {children}
            <MiniPlayer />
            <Toaster />
          </MusicProvider>
          <Chatbot />
        </ThemeProvider>

        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

      </body>
    </html>
  )
}
