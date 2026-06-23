"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  File,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";

type NavItem = {
  label: string;
  id: string;
};

export default function PoliciesContent({
  settings,
}: {
  settings: ISettingSafe;
}) {
  const [activeSection, setActiveSection] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];
    if (settings.termsOfService)
      items.push({ label: "Terms & Conditions", id: "terms-of-service" });
    if (settings.privacyPolicy)
      items.push({ label: "Privacy Policy", id: "privacy-policy" });
    if (settings.returnPolicy)
      items.push({ label: "Return & Refund Policy", id: "return-policy" });
    return items;
  }, [settings.termsOfService, settings.privacyPolicy, settings.returnPolicy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: "-35% 0px -60% 0px", threshold: 0.01 },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const proseClasses = `
    prose prose-base max-w-none
    prose-headings:font-semibold
    prose-p:text-gray-700
    prose-p:leading-relaxed
    dark:prose-invert
  `;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-20">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={containerRef}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary">
            Legal Information
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about our terms, privacy practices, and
            policies at NRB School.
          </p>
        </motion.header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-primary text-white font-semibold">
                  Quick Navigation
                </div>

                <nav
                  className="p-3 flex flex-col gap-2"
                  aria-label="Policy navigation"
                >
                  {navItems.map((item) => {
                    const active = activeSection === item.id;
                    let Icon = File;
                    if (item.id === "privacy-policy") Icon = Shield;
                    if (item.id === "return-policy") Icon = DollarSign;

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

              {/* Contact card */}
              <div className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Need help?
                </h4>
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  {settings.email && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Mail size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium break-words">
                          {settings.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {settings.phoneNumber && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Phone size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium">
                          {settings.phoneNumber}
                        </div>
                      </div>
                    </div>
                  )}

                  {settings.address && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Address</div>
                        <div className="font-medium">{settings.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* Terms */}
            {settings.termsOfService && (
              <motion.section
                id="terms-of-service"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <File size={28} />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Terms & Conditions
                    </h2>
                    <p className="text-sm opacity-90">
                      Applicable policies and terms of use
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{
                      __html: settings.termsOfService,
                    }}
                  />
                </div>
              </motion.section>
            )}

            {/* Privacy */}
            {settings.privacyPolicy && (
              <motion.section
                id="privacy-policy"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <Shield size={28} />
                  <div>
                    <h2 className="text-lg font-semibold">Privacy Policy</h2>
                    <p className="text-sm opacity-90">
                      How we collect, use, and protect data
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
                  />
                </div>
              </motion.section>
            )}

            {/* Return & Refund */}
            {settings.returnPolicy && (
              <motion.section
                id="return-policy"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-t-2xl">
                  <DollarSign size={28} />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Return & Refund Policy
                    </h2>
                    <p className="text-sm opacity-90">
                      Terms for cancellations, refunds, and returns
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{ __html: settings.returnPolicy }}
                  />
                </div>
              </motion.section>
            )}
          </div>
        </div>

        {/* Mobile quick nav */}
        {navItems.length > 0 && (
          <div className="lg:hidden mt-8">
            <div className="bg-white dark:bg-gray-800 border rounded-2xl shadow-sm p-3 flex gap-2 overflow-x-auto">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`px-3 py-2 rounded-md text-sm whitespace-nowrap transition ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    aria-pressed={active}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
