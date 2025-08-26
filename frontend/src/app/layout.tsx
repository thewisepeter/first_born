import './globals.css';
import type { Metadata } from 'next';

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
