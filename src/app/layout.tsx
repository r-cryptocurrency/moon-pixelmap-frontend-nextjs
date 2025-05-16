import './globals.css';
import '@/components/styles.css'; // Import custom component styles

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import providers
import Providers from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
