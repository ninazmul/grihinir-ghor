import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import AboutContent from "@/components/shared/AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us | NRB School",
    description:
      "Learn more about our mission, mentors, and how we help students succeed.",
    keywords: [
      "About NRB School",
      "Mission",
      "Mentors",
      "Student Success",
      "NSDA",
      "BTEB",
    ],
    alternates: {
      canonical: "https://www.nrbschool.com/about",
    },
    openGraph: {
      title: "About Us | NRB School",
      description:
        "Learn more about our mission, mentors, and how we help students succeed.",
      url: "https://www.nrbschool.com/about",
      siteName: "NRB School",
      images: [
        {
          url: "https://www.nrbschool.com/assets/images/placeholder.png",
          width: 1200,
          height: 630,
          alt: "About NRB School",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "About Us | NRB School",
      description:
        "Learn more about our mission, mentors, and how we help students succeed.",
      images: "/assets/images/placeholder.png",
    },
  };
}

export default async function AboutPage() {
  const settings = await getSetting();

  return <AboutContent settings={settings} />;
}
