import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BECOF - Orientation Universitaire en Tunisie",
  description: "Conseil en orientation universitaire pour les bacheliers tunisiens. Trouvez la bonne université et tracez votre chemin vers le succès.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
