import type { Metadata } from "next";
import { Ovo, Figtree, DM_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { FootprintProvider } from "@/app/components/shared/FootprintProvider";
import { SiteFrame } from "@/app/components/layout/SiteFrame";
import { CircleCursor } from "@/app/components/shared/CircleCursor";
import { BackgroundStyles } from "@/app/components/layout/Background";

// Ovo — section / case-study titles + the italic moments (the wordmark,
// section headers, italic taglines). Single weight, no italic face (the
// browser synthesizes italic where needed). Figtree for body copy; DM Mono
// for interface labels.
const ovo = Ovo({
  variable: "--font-ovo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://shruthiaragonda.com";
const SITE_TITLE = "Shruthi: Multidisciplinary Design Engineer";
const SITE_DESCRIPTION =
  "A multidisciplinary design engineer building new ways for people to interact with technology, from AI to the physical world.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Footprint favicon — a lion track in the signature gradient, no background.
  // This static file is the pre-hydration icon; FootprintProvider then swaps in
  // the identical live one. Both come from footprintTileSvg in app/lib/footprints.
  icons: {
    icon: [
      { url: "/favicon-light.svg", type: "image/svg+xml" },
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
        alt: "Shruthi: Multidisciplinary Design Engineer",
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ovo.variable} ${figtree.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FootprintProvider>
          <BackgroundStyles />
          {/* Route-aware: home (/) renders the footprints page bare; inner
              pages get the top bar + sticky sky backdrop + curtain footer. */}
          {/* Light/dark lives in the footer's FooterControls (the bat toggle),
              shared by every page — no separate global floating bat. */}
          <SiteFrame>{children}</SiteFrame>
          <CircleCursor />
        </FootprintProvider>
        {/* GA only loads when the env var is set — silent in dev without a key */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
