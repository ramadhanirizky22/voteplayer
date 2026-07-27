import type { Metadata } from 'next';
import { AppProvider } from '@/providers/app-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'VotePlay - Production Ready Boilerplate',
  description: 'Scalable production-grade Next.js App Router boilerplate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
