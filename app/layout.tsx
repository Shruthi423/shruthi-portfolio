import type { Metadata, Viewport } from "next";
import {
  Ovo,
  Figtree,
  DM_Mono,
  Gochi_Hand,
  Homemade_Apple,
  Schoolbell,
  Bricolage_Grotesque,
  Grandstander,
  Pixelify_Sans,
} from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { FootprintProvider } from "@/app/components/shared/FootprintProvider";
import { SiteFrame } from "@/app/components/layout/SiteFrame";
import { CircleCursor } from "@/app/components/shared/CircleCursor";
import Splash from "@/app/components/layout/Splash";

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

// Three handwriting faces, loaded and ready to be pointed at whatever they
// belong to. Single weight each, no italic face.
const gochiHand = Gochi_Hand({
  variable: "--font-gochi-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const homemadeApple = Homemade_Apple({
  variable: "--font-homemade-apple",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const schoolbell = Schoolbell({
  variable: "--font-schoolbell-face",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Three display faces for the hero's rotating verb, which sets each of its eight
// words in a face chosen for that word's motion.
//
// Bricolage Grotesque carries an optical-size axis as well as weight, and it is
// listed here so the browser can pick the display cut by itself: the verb is set
// at up to 84px, and without opsz the face would render at its text optical
// size all the way up.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-face",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

// Grandstander, for "Shaping": rounded with slightly goofy proportions, and a
// weight axis, so the word can be set a little heavy without a second file.
// Jost used to sit here and was loaded with its real italic, which was the whole
// point of it — that word straightened out of true italic letterforms rather
// than out of a skew. The word rolls in now, which is a thing that happens to a
// letter's position and not to its shape, so the italic was paying for a file
// nothing read and the face went with it.
const grandstander = Grandstander({
  variable: "--font-grandstander-face",
  subsets: ["latin"],
  display: "swap",
});

// Pixelify Sans, for "Rewiring": letters drawn on a visible pixel grid, which is
// the one face in the set actually built out of parts — and that word's effect is
// two of its parts trading places. Its tittles are square, like everything else
// in it, so the two this word draws for itself are square too (see Face.dotSquare
// in RotatingWord).
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify-face",
  subsets: ["latin"],
  display: "swap",
});


const SITE_URL = "https://shruthiaragonda.com";
// Browser-tab text, next to the favicon.
const TAB_TITLE = "Shruthi's Portfolio";
// Social cards keep the fuller line.
const SITE_TITLE = "Shruthi: Multidisciplinary Design Engineer";
const SITE_DESCRIPTION =
  "A multidisciplinary design engineer building new ways for people to interact with technology, from AI to the physical world.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TAB_TITLE,
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


/**
 * Next already emits `width=device-width, initial-scale=1`; this adds the two
 * things it doesn't. themeColor paints the browser chrome on mobile to match
 * the paper, and the site is light-only so colorScheme says so rather than
 * letting a dark-mode browser try to invert form controls.
 *
 * No maximumScale / userScalable: pinch-zoom stays available, which it must.
 */
export const viewport: Viewport = {
  themeColor: "#fafaf8",
  colorScheme: "light",
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
      className={`${ovo.variable} ${figtree.variable} ${dmMono.variable} ${gochiHand.variable} ${homemadeApple.variable} ${schoolbell.variable} ${bricolage.variable} ${grandstander.variable} ${pixelify.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Kill the browser's scroll restoration before it happens. The splash
            plays on every load and lifts onto the top of the page, so a restored
            offset would drop you straight into the work grid. This has to run
            during parse, not in an effect: by hydration the restore has already
            been scheduled. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if("scrollRestoration" in history)history.scrollRestoration="manual";',
          }}
        />
        <FootprintProvider>
          {/* Route-aware: the home (/) renders bare; inner pages get the
              shared nav + footer appended around the page content. */}
          <SiteFrame>{children}</SiteFrame>
          {/* Above the frame and the cursor: once per tab, the count climbs to
              100 and then lifts into whatever page you actually asked for. */}
          <Splash />
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
