import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prophet Namara Ernest',
  description: 'Join us as we grow together in Christ and serve our community with compassion and purpose.',
  keywords: 'church, faith, community, worship, sermons, testimonies, Grace Church',
  authors: [{ name: 'Grace Church' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/prophet_namara_logo.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}