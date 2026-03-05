import type { Metadata } from 'next';
import './globals.css';
import KitchenDashboard from './page';

export const metadata: Metadata = {
  title: 'Kitchen Dashboard — BunMart',
  description: 'Production order management for BunMart kitchen staff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
