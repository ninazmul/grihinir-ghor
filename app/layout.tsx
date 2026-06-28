import { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "Grihinir Ghor | Your Home Essentials Store",
  description:
    "Grihinir Ghor is your trusted destination for premium home essentials, kitchen accessories, organic food, and handcrafted items.",
  keywords: [
    "Home Essentials",
    "Kitchen Accessories",
    "Home Decor",
    "Organic Food",
    "Handcrafted Items",
    "Grihinir Ghor",
  ],
  metadataBase: new URL("https://www.grihinir-ghor.com"),
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "/assets/images/placeholder.png",
  },
  alternates: {
    canonical: "https://www.grihinir-ghor.com/",
  },
  openGraph: {
    title: "Grihinir Ghor | Your Home Essentials Store",
    description:
      "Grihinir Ghor offers premium home essentials, kitchen accessories, organic food, and handcrafted items for your home.",
    url: "https://www.grihinir-ghor.com/",
    siteName: "Grihinir Ghor",
    images: [
      {
        url: "https://www.grihinir-ghor.com/assets/images/placeholder.png",
        width: 1200,
        height: 630,
        alt: "Grihinir Ghor",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grihinir Ghor | Your Home Essentials Store",
    description:
      "Discover premium home essentials and handcrafted items at Grihinir Ghor.",
    images: ["/assets/images/placeholder.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
