import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import AboutContent from "@/components/shared/AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us | Grihinir Ghor",
    description:
      "Learn more about Grihinir Ghor, our mission, and how we bring quality home essentials to your doorstep.",
    keywords: [
      "About Grihinir Ghor",
      "Home Essentials",
      "Our Mission",
      "Quality Products",
    ],
    alternates: {
      canonical: "https://www.grihinir-ghor.com/about",
    },
    openGraph: {
      title: "About Us | Grihinir Ghor",
      description:
        "Learn more about Grihinir Ghor, our mission, and how we bring quality home essentials to your doorstep.",
      url: "https://www.grihinir-ghor.com/about",
      siteName: "Grihinir Ghor",
      images: [
        {
          url: "https://www.grihinir-ghor.com/assets/images/placeholder.png",
          width: 1200,
          height: 630,
          alt: "About Grihinir Ghor",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "About Us | Grihinir Ghor",
      description:
        "Learn more about Grihinir Ghor, our mission, and how we bring quality home essentials to your doorstep.",
      images: "/assets/images/placeholder.png",
    },
  };
}

export default async function AboutPage() {
  const settings = await getSetting();

  return <AboutContent settings={settings} />;
}
