import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://assessment-feedback-documents.maian6396.chatgpt.site'),
  title: 'Assessment and Feedback Toolkit',
  description: 'Create editable assessment guidance before assessment and cohort-level general feedback after assessment.',
  openGraph: {
    title: 'Assessment and Feedback Toolkit',
    description: 'Clearer assessment. More useful feedback. Editable Word documents for university educators.',
    images: ['/assessment-feedback-social.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assessment and Feedback Toolkit',
    description: 'Clearer assessment. More useful feedback. Editable Word documents for university educators.',
    images: ['/assessment-feedback-social.png'],
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
