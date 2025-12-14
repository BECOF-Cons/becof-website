import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check moved to individual pages to avoid redirect loop on login page
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
