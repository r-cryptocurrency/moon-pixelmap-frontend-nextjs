import './globals.css';
import '@/components/styles.css'; // Import custom component styles

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import providers
import { Providers } from './providers';

// Metadata export for SEO
export const metadata = {
  title: 'MoonPlace.io - Pixel Map',
  description: 'A collaborative pixel map on the blockchain. Own, customize, and trade pixels on Arbitrum Nova.',
  keywords: 'pixel map, NFT, blockchain, Arbitrum Nova, crypto, art',
  openGraph: {
    title: 'MoonPlace.io - Pixel Map',
    description: 'A collaborative pixel map on the blockchain.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-red-500 to-orange-400 text-white m-0 p-0">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col mb-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
