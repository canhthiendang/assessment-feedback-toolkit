import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KBS Module Assessment and Feedback Guide Generator',
  description: 'Create a consistent, editable assessment and feedback guide for a module.',
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
