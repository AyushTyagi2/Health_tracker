import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Health Monitor App',
  description: 'Track health vitals in real-time',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
