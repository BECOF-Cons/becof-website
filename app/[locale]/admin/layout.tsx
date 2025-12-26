import { Inter } from 'next/font/google';
import '../../globals.css';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!['en', 'fr'].includes(locale)) {
    notFound();
  }

  // Auth check moved to individual pages to avoid redirect loop on login page
  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
