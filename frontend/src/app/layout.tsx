import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Noteveda | Academic Resource Hub for Students",
    template: "%s | Noteveda"
  },
  description: "Discover, share, and learn from a community-driven library of premium study materials, notes, and guides. Join 45,000+ students on Noteveda.",
  keywords: ["study notes", "academic resources", "PDF notes", "JEE preparation", "NEET notes", "CBSE", "GATE", "university notes", "exam preparation", "study materials"],
  authors: [{ name: "Noteveda Team" }],
  creator: "Noteveda",
  publisher: "Noteveda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://noteveda.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Noteveda",
    title: "Noteveda | Academic Resource Hub for Students",
    description: "Discover, share, and learn from a community-driven library of premium study materials. AI-powered summaries, smart Q&A, and earn credits by sharing your notes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Noteveda - Academic Resource Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noteveda | Academic Resource Hub for Students",
    description: "Discover, share, and learn from a community-driven library of premium study materials.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon-32x32.png?v=2', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png?v=2',
    shortcut: '/favicon-16x16.png?v=2',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: "google-site-verification-code",
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'noteveda_theme';
                  var className = 'dark';
                  var d = document.documentElement;
                  var localStorageTheme = localStorage.getItem(storageKey);
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (localStorageTheme === 'dark' || (!localStorageTheme && supportDarkMode)) {
                    d.classList.add(className);
                  } else {
                    d.classList.remove(className);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

