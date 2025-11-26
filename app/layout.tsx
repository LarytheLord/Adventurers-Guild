import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "../styles/accessibility.css"
import { ThemeProvider } from "../components/theme-provider"
import { SessionProvider } from "../components/session-provider"
import Script from "next/script"
import A11ySkipLink from "../components/A11ySkipLink"
import Navigation from "../components/Navigation"
import ErrorBoundary from "../components/ErrorBoundary"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Adventurers Guild",
  description: "Created with Adventure",
  manifest: "/manifest.json",
  icons: {
    icon: "/pwa/icon-192x192.svg",
    apple: "/pwa/icon-192x192.svg",
  },
  generator: "Adventurers",
  other: {
    "color-scheme": "light dark",
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/pwa/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/pwa/icon-192x192.svg" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <A11ySkipLink />

        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div id="main-content" className="min-h-screen flex-col">
              <Navigation />
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>

        <Script id="scrollbar-handler" strategy="afterInteractive">
          {`
            (function () {
              var timeout;
              var root = document.documentElement;

              function show() {
                root.classList.add('show-scrollbar');
                document.body.classList.add('show-scrollbar');
                clearTimeout(timeout);
                timeout = setTimeout(hide, 2000);
              }
              function hide() {
                root.classList.remove('show-scrollbar');
                document.body.classList.remove('show-scrollbar');
              }

              window.addEventListener('scroll', show, { passive: true });
              window.addEventListener('wheel', show, { passive: true });
              window.addEventListener('touchmove', show, { passive: true });
              window.addEventListener('keydown', function (e) {
                var keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '];
                if (keys.includes(e.key)) show();
              });

              hide();
            })();
          `}
        </Script>
      </body>
    </html>
  )
}