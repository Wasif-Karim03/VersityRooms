import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { ToastProvider } from "@/src/components/ui/toast"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Room Booking",
  description: "Book and manage university room reservations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

