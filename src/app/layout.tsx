import './globals.css';
import '@/components/styles.css'; // Import custom component styles

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UmamiAnalytics } from '@/components/UmamiAnalytics';

// Import providers
import { Providers } from './providers';

// Metadata export for SEO
export const metadata = {
  metadataBase: new URL('https://moonplace.io'),
  title: 'MoonPlace.io - Archived',
  description: 'Moonplace, the Moon Pixel Map, has reached the end of its journey and is now preserved in permanent archive mode.',
  keywords: 'pixel map, archive, Moonplace, Moon Pixel Map',
  openGraph: {
    title: 'MoonPlace.io — Archived',
    description: 'So long, and thanks for all the fish. The final Moon Pixel Map snapshot, preserved. Something new is coming.',
    type: 'website',
    url: 'https://moonplace.io',
    siteName: 'MoonPlace',
    images: [
      {
        url: '/final-snapshot.png',
        width: 1000,
        height: 1000,
        alt: 'The final Moonplace pixel map snapshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoonPlace.io — Archived',
    description: 'So long, and thanks for all the fish. The final Moon Pixel Map snapshot, preserved. Something new is coming.',
    images: ['/final-snapshot.png'],
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
          <UmamiAnalytics />
          <Header />
          <main className="flex-1 flex flex-col mb-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
