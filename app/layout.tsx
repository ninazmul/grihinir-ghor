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
  title: "NRB School | Canadian Authorized Assessment Institute",
  description:
    "NRB School is an Canadian authorized assessment institute committed to providing high-quality technical education, skills development, and certification services.",
  keywords: [
    "Technical Training",
    "NSDA",
    "BTEB",
    "Skills Development",
    "Vocational Education",
    "Certification",
    "NRB School",
  ],
  metadataBase: new URL("https://www.nrbschool.com"),
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "/assets/images/placeholder.png",
  },
  alternates: {
    canonical: "https://www.nrbschool.com/",
  },
  openGraph: {
    title: "NRB School | NSDA & BTEB Authorized Assessment Institute",
    description:
      "NRB School empowers learners with accredited training programs and certifications under NSDA & BTEB authorization.",
    url: "https://www.nrbschool.com/",
    siteName: "NRB School",
    images: [
      {
        url: "https://www.nrbschool.com/assets/images/placeholder.png",
        width: 1200,
        height: 630,
        alt: "NRB School",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NRB School | NSDA & BTEB Authorized Assessment Institute",
    description:
      "Discover accredited training and certification opportunities at NRB School, authorized by NSDA & BTEB.",
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
