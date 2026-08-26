import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kbs-module-guide-generator.maian6396.chatgpt.site'),
  title: 'KBS Module Assessment and Feedback Guide Generator',
  description: 'Create an editable module assessment and feedback guide manually or with ChatGPT-assisted syllabus extraction.',
  openGraph: {
    title: 'KBS Module Assessment and Feedback Guide Generator',
    description: 'Start from your syllabus with ChatGPT or complete the guide manually, then download an editable Word document.',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KBS Module Assessment and Feedback Guide Generator',
    description: 'Start from your syllabus with ChatGPT or complete the guide manually, then download an editable Word document.',
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
