import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "../styles/accessibility.css"
import { ThemeProvider } from "../components/theme-provider"
import { SessionProvider } from "../components/session-provider"
import Script from "next/script"
import A11ySkipLink from "../components/A11ySkipLink"
import Navigation from "../components/Navigation"

export const metadata: Metadata = {
  title: "Adventurers Guild",
  description: "Created with Adventure",
  themeColor: "#ffffff",
  manifest: "/manifest.json",
  icons: {
    icon: "/pwa/icon-192x192.png",
    apple: "/pwa/icon-192x192.png",
  },
  generator: "Adventurers",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  // Accessibility metadata
  other: {
    "color-scheme": "light dark",
  }
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
        <link rel="icon" href="/pwa/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/pwa/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Accessibility additions */}
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
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>

        {/* Show scrollbar during scroll; hide 2s after idle */}
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

              // show on any scroll-like interaction
              window.addEventListener('scroll', show, { passive: true });
              window.addEventListener('wheel', show, { passive: true });
              window.addEventListener('touchmove', show, { passive: true });
              window.addEventListener('keydown', function (e) {
                // keys that can scroll the page
                var keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '];
                if (keys.includes(e.key)) show();
              });

              // ensure hidden on load
              hide();
            })();
          `}
        </Script>
      </body>
    </html>
  )
}