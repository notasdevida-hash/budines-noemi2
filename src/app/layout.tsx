
import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/components/cart-provider';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Budines Noemi | Dulzura Artesanal',
  description: 'Budines artesanales hechos con amor. Disfruta de la mejor calidad en repostería casera.',
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
      </body>
    </html>
  );
}
