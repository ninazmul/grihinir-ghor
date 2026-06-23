"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Info,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import Link from "next/link";

type NavItem = {
  label: string;
  id: string;
};

export default function AboutContent({
  settings,
}: {
  settings: ISettingSafe | null;
}) {
  const [activeSection, setActiveSection] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];
    if (settings?.description)
      items.push({ label: "About", id: "about-section" });
    if (settings?.email || settings?.phoneNumber || settings?.address)
      items.push({ label: "Contact", id: "contact-section" });
    if (
      settings?.facebook ||
      settings?.instagram ||
      settings?.twitter ||
      settings?.youtube ||
      settings?.facebookGroup
    )
      items.push({ label: "Social", id: "social-section" });
    return items;
  }, [settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0.01 },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const proseClasses = `
    prose prose-base max-w-none
    prose-headings:font-semibold
    prose-p:text-gray-700
    prose-p:leading-relaxed
    dark:prose-invert
  `;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-20">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={containerRef}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary">
            About Us
          </h1>
          <p className="mt-3 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Learn who we are, our mission, and how we support learners across
            Canada with accredited online programs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-primary text-white font-semibold">
                  Quick Navigation
                </div>

                <nav className="p-3 flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = activeSection === item.id;
                    let Icon = Info;
                    if (item.id === "mission-section") Icon = LinkIcon;
                    if (item.id === "team-section") Icon = Users;
                    if (item.id === "contact-section") Icon = Phone;
                    if (item.id === "social-section") Icon = Globe;

                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition ${
                          active
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        aria-current={active ? "true" : "false"}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={16}
                            className={
                              active ? "text-primary" : "text-gray-400"
                            }
                          />
                          <span>{item.label}</span>
                        </div>

                        {active ? (
                          <ChevronDown size={16} className="text-primary" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Small contact card */}
              <div className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Get in touch
                </h4>
                <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
                  {settings?.phoneNumber && (
                    <a
                      href={`tel:${settings.phoneNumber}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Phone size={16} /> <span>{settings.phoneNumber}</span>
                    </a>
                  )}
                  {settings?.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Mail size={16} /> <span>{settings.email}</span>
                    </a>
                  )}
                  {settings?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} /> <span>{settings.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* About */}
            {settings?.description && (
              <motion.section
                id="about-section"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <Info size={28} />
                  <div>
                    <h2 className="text-xl font-semibold">About</h2>
                    <p className="text-sm opacity-90">
                      Who we are and what we do
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{ __html: settings.description }}
                  />
                </div>
              </motion.section>
            )}

            {/* Contact */}
            {(settings?.email ||
              settings?.phoneNumber ||
              settings?.address) && (
              <motion.section
                id="contact-section"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <Phone size={28} />
                  <div>
                    <h2 className="text-xl font-semibold">Contact</h2>
                    <p className="text-sm opacity-90">How to reach us</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-primary" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Phone
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {settings?.phoneNumber || "Not provided"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-primary" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Email
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {settings?.email || "Not provided"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-primary" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Address
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {settings?.address || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Social */}
            {(settings?.facebook ||
              settings?.instagram ||
              settings?.twitter ||
              settings?.youtube ||
              settings?.facebookGroup) && (
              <motion.section
                id="social-section"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <Globe size={28} />
                  <div>
                    <h2 className="text-xl font-semibold">Follow Us</h2>
                    <p className="text-sm opacity-90">
                      Stay connected on social media
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {settings?.facebook && (
                      <a
                        href={settings.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
                      >
                        <FaFacebook /> Facebook
                      </a>
                    )}
                    {settings?.instagram && (
                      <a
                        href={settings.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white"
                      >
                        <FaInstagram /> Instagram
                      </a>
                    )}
                    {settings?.twitter && (
                      <a
                        href={settings.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white"
                      >
                        <FaTwitter /> Twitter
                      </a>
                    )}
                    {settings?.youtube && (
                      <a
                        href={settings.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white"
                      >
                        <FaYoutube /> YouTube
                      </a>
                    )}
                    {settings?.facebookGroup && (
                      <a
                        href={settings.facebookGroup}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 text-gray-900 dark:text-white"
                      >
                        <Users /> Community
                      </a>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
