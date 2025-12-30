import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import '../globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  
  // Check if current route is admin route
  const headersList = await headers();
  const isAdminRoute = headersList.get('x-is-admin') === 'true';

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {isAdminRoute ? (
            // Admin routes: no navbar/footer
            <div className="min-h-screen bg-gray-50">{children}</div>
          ) : (
            // Public routes: with navbar/footer
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
