import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TechServe Hub — Laptop Repair & 3D Printing Services',
  description:
    'Get your laptop repaired or 3D print your project parts instantly. Expert services for students and professionals at your college.',
  keywords: ['laptop repair', '3D printing', 'college services', 'student tech services'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
