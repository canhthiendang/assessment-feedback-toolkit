import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kbs-module-guide-generator.maian6396.chatgpt.site'),
  title: 'KBS Module Assessment and Feedback Guide Generator',
  description: 'Create a consistent, editable assessment and feedback guide for a module.',
  openGraph: {
    title: 'KBS Module Assessment and Feedback Guide Generator',
    description: 'Create a clear, consistent and editable assessment and feedback guide for your module.',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KBS Module Assessment and Feedback Guide Generator',
    description: 'Create a clear, consistent and editable assessment and feedback guide for your module.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
