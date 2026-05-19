import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import { Footer, FOOTER_HEIGHT } from "./components/Footer";
import { CircleCursor } from "./components/CircleCursor";
import { IntroOverlay } from "./components/IntroOverlay";
import {
  BackgroundStyles,
  DayNightToggle,
  SkyScene,
} from "./components/Background";

// Fraunces — section / case-study titles + the italic moments that used to be
// EB Garamond. Self-hosted variable font with the full 4-axis set baked in:
// wght (100–900), opsz, SOFT, WONK. Reach SOFT/WONK from CSS with
// `font-variation-settings: "SOFT" 50, "WONK" 1`.
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Fraunces-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/Fraunces-VariableItalic.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
});

// Figtree — the sans-serif: body copy, nav, footer links, tags, cursor pill.
// (Replaced Barlow on 2026-05-19.) Variable font — one file covers all weights;
// normal + italic loaded.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Dahlia — statement font, big headings only. Regular weight (400).
const dahlia = localFont({
  variable: "--font-dahlia",
  display: "swap",
  src: [
    {
      path: "../public/fonts/dahlia-regular.woff",
      weight: "400",
      style: "normal",
    },
  ],
});

const SITE_URL = "https://shruthiaragonda.com";
const SITE_TITLE = "Shruthi — Multidisciplinary Designer";
const SITE_DESCRIPTION =
  "A multidisciplinary designer's portfolio — identity systems, visual storytelling, and AI-native prototyping.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Shruthi",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpeg",
        width: 1066,
        height: 1600,
        alt: "Shruthi — Multidisciplinary Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@shruthi00129",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpeg"],
  },
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||((s==='system'||!s)&&m);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${figtree.variable} ${dahlia.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <BackgroundStyles />
          <Navbar />
          <main
            className="relative z-10 flex-1"
            style={{ marginBottom: FOOTER_HEIGHT }}
          >
            {/* Sticky sky backdrop — stays in the viewport while content
                scrolls over it, then scrolls away to reveal the footer. */}
            <div className="sticky top-0 h-screen" style={{ zIndex: 0 }}>
              <SkyScene />
            </div>
            {/* Content is pulled up to overlap the sky backdrop. */}
            <div
              className="relative"
              style={{ zIndex: 1, marginTop: "-100vh" }}
            >
              {children}
            </div>
          </main>
          <Footer />
          <DayNightToggle />
          <CircleCursor />
          <IntroOverlay />
        </ThemeProvider>
        {/* GA only loads when the env var is set — silent in dev without a key */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
