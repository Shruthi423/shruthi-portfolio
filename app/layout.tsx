import type { Metadata } from "next";
import { EB_Garamond, Figtree, Rock_Salt, DM_Mono } from "next/font/google";
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

// Rock Salt — handwritten cursive, used for scribbled overlay text on case
// studies (e.g. Feeld's "Through the lens..." overlay on the in-world image,
// and the per-screen scribbles in the app reel). Single weight, latin only.
const rockSalt = Rock_Salt({
  variable: "--font-rocksalt",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// DM Mono — the label face: nav, tags, cursor pill, footer links, micro-labels.
// (Replaced the Figtree-as-mono legacy token.) Monospace, Google-hosted; not a
// variable font, so weights are listed explicitly.
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://shruthiaragonda.com";
const SITE_TITLE = "Shruthi — Multidisciplinary Designer";
const SITE_DESCRIPTION =
  "A multidisciplinary designer's portfolio — identity systems, visual storytelling, and AI-native prototyping.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Paw-print favicon — terracotta by day, clay by night (matches the home prints).
  icons: {
    icon: [
      { url: "/favicon-light.svg", type: "image/svg+xml" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml" },
    ],
  },
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

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||((s==='system'||!s)&&m);if(d)document.documentElement.classList.add('dark');var C={white:'#fbfbf9',blush:'#f4ccd0',butter:'#fbe9a8',mint:'#cdebc5',sky:'#c8e8f6'};var c=localStorage.getItem('paper-color');if(c&&C[c])document.documentElement.style.setProperty('--hue',C[c]);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${figtree.variable} ${dmMono.variable} ${rockSalt.variable} h-full antialiased`}
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
