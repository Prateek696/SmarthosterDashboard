import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartHoster | Airbnb & Short-Term Rental Management in Portugal",
  description: "Local, full-service property management for Alojamento Local (AL) in Portugal. Cleaning, linens, check-ins, compliance & guest support – all included.",
  keywords: ["Airbnb management", "property management", "Portugal", "Alojamento Local", "short-term rentals"],
  authors: [{ name: "SmartHoster" }],
  openGraph: {
    title: "SmartHoster | Airbnb & AL Property Management Portugal",
    description: "SmartHoster handles listings, guests, check-ins, linens, cleaning & AL compliance. Full-service property management in Portugal.",
    url: "https://www.smarthoster.io/",
    siteName: "SmartHoster",
    images: [
      {
        url: "https://www.smarthoster.io/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SmartHoster",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartHoster | Airbnb Property Management Portugal",
    description: "Trusted AL property management in Portugal. We handle it all – so you don't have to.",
    images: ["https://www.smarthoster.io/og-image.jpg"],
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
  verification: {
    google: "google5500ee3d78e63d96",
  },
  alternates: {
    canonical: "https://www.smarthoster.io/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5QQT59WN');`,
          }}
        />
        
        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0LH860VBV3"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0LH860VBV3');
            `,
          }}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SmartHoster",
              url: "https://www.smarthoster.io",
              logo: "https://www.smarthoster.io/favicon.ico",
              description: "SmartHoster provides full-service Airbnb and Alojamento Local (AL) property management in Portugal. Cleaning, linens, guest check-ins, and AL compliance included.",
              sameAs: [
                "https://www.instagram.com/smarthoster.io",
                "https://www.facebook.com/smarthoster.io",
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5QQT59WN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
