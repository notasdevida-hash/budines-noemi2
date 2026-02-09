
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/components/cart-provider';
import { FirebaseClientProvider } from '@/firebase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://budinesnoemi.com';

export const viewport: Viewport = {
  themeColor: '#A69079',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Budines Noemi | Budines Artesanales y Caseros en Buenos Aires',
    template: '%s | Budines Noemi'
  },
  description: 'Descubrí los mejores budines artesanales de Buenos Aires. Recetas familiares, ingredientes naturales y envíos a CABA y GBA. ¡Pedí tu budín recién horneado hoy!',
  keywords: ['budines artesanales', 'budines caseros', 'repostería artesanal Buenos Aires', 'budín de limón casero', 'venta de budines CABA', 'regalos dulces'],
  authors: [{ name: 'Noemi Garcia' }],
  creator: 'Noemi Garcia',
  publisher: 'Budines Noemi',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'Budines Noemi',
    title: 'Budines Noemi | Dulzura Artesanal en tu Mesa',
    description: 'Budines hechos con amor en Buenos Aires. Calidad premium y sabor casero garantizado.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Budines Noemi - Dulzura Artesanal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budines Noemi | Dulzura Artesanal',
    description: 'Los mejores budines caseros de Buenos Aires.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧁</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </FirebaseClientProvider>
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Budines Noemi",
              "image": `${siteUrl}/og-image.jpg`,
              "@id": siteUrl,
              "url": siteUrl,
              "telephone": "+5491112345678",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Zona CABA y GBA",
                "addressLocality": "Buenos Aires",
                "addressRegion": "CABA",
                "postalCode": "1425",
                "addressCountry": "AR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -34.6037,
                "longitude": -58.3816
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "09:00",
                "closes": "20:00"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
