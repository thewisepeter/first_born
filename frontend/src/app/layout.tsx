import './globals.css';
import { Navigation } from './components/Navigation';
import { FloatingContact } from './components/FloatingContact';
import { Footer } from './components/Footer';
import type { Metadata } from 'next';
import { CsrfInitializer } from './components/CsrfInitializer';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Prophet Namara Ernest',
  description: 'Prophet of God sent to preserve and protect the people of God',
  keywords: 'Prophesy, Fellowship, church, faith, community, worship, sermons, testimonies, Grace',
  authors: [{ name: 'Prophet Namara Ernest' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/prophet_namara_logo.png" sizes="32x32" />
        <link rel="icon" href="/prophet_namara_logo.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/prophet_namara_logo.png" />
      </head>

      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {/* Global initializers */}
          <CsrfInitializer />

          {/* Global navigation */}
          <Navigation />

          {/* Page content */}
          <main className="flex-1">{children}</main>
          {/* Global footer */}
          <Footer />

          {/* Floating contact button */}
          <FloatingContact />
        </AuthProvider>
      </body>
    </html>
  );
}
