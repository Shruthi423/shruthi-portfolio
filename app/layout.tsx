import type { Metadata } from "next";
import { EB_Garamond, Figtree } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SiteFrame } from "./components/SiteFrame";
import { CircleCursor } from "./components/CircleCursor";
import { IntroOverlay } from "./components/IntroOverlay";
import { BackgroundStyles, DayNightToggle } from "./components/Background";

// EB Garamond — section / case-study titles + the italic moments (the wordmark,
// section headers, italic taglines). Variable Google font (wght 400–800),
// auto self-hosted by next/font; normal + italic loaded.
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
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

// Dahlia — statement font, big headings only. Bold weight (700).
const dahlia = localFont({
  variable: "--font-dahlia",
  display: "swap",
  src: [
    {
      path: "../public/fonts/dahlia-bold.woff",
      weight: "700",
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
      className={`${ebGaramond.variable} ${figtree.variable} ${dahlia.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <BackgroundStyles />
          {/* Route-aware: home (/) renders the footprints page bare; inner
              pages get the top bar + sticky sky backdrop + curtain footer. */}
          <SiteFrame>{children}</SiteFrame>
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
