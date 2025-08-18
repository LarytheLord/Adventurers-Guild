import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import Script from "next/script"

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/pwa/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/pwa/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>

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
