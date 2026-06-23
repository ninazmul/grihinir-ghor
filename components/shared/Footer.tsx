"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getSetting } from "@/lib/actions";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaFacebookF, FaUsers } from "react-icons/fa6";
import Link from "next/link";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const [setting, setSetting] = useState<ISettingSafe | null>(null);

  const links = [
    { label: "About Us", route: "/about" },
    { label: "All Courses", route: "/courses" },
    { label: "Certificate Verify", route: "/verify" },
    { label: "Gallery", route: "/gallery" },
    { label: "Contact Us", route: "/contact" },
    { label: "Our Policies", route: "/policies" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting();
        setSetting(setting);
      } catch (err) {
        console.error("Settings load failed", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="shadow-inner">
      {/* Top Layer: Branding + Info */}
      <div className="bg-white border-t border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 justify-items-center gap-10 max-w-7xl mx-auto"
        >
          {/* Logo/About */}
          <div className="space-y-4 text-center md:text-left">
            <Image
              src={setting?.logo || "/assets/images/logo.png"}
              alt="Logo"
              width={150}
              height={150}
              priority
              className="mx-auto md:mx-0 rounded-md border border-primary"
            />
            <h2 className="text-xl font-bold text-primary">{setting?.name}</h2>
            {setting?.tagline && (
              <p className="text-gray-600 italic">{setting.tagline}</p>
            )}
            {/* Social Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              {setting?.facebook && (
                <a
                  href={setting.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white rounded-full p-2 flex items-center justify-center hover:bg-primary transition"
                >
                  <FaFacebookF size={18} />
                </a>
              )}
              {setting?.instagram && (
                <a
                  href={setting.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white rounded-full p-2 flex items-center justify-center hover:bg-primary transition"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {setting?.twitter && (
                <a
                  href={setting.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white rounded-full p-2 flex items-center justify-center hover:bg-primary transition"
                >
                  <FaTwitter size={18} />
                </a>
              )}
              {setting?.facebookGroup && (
                <a
                  href={setting.facebookGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white rounded-full p-2 flex items-center justify-center hover:bg-primary transition"
                >
                  <FaUsers size={18} />
                </a>
              )}
              {setting?.youtube && (
                <a
                  href={setting.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white rounded-full p-2 flex items-center justify-center hover:bg-primary transition"
                >
                  <FaYoutube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Contact + Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:justify-items-center w-full px-12">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Contacts</h3>
              {setting?.phoneNumber && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Phone size={16} /> <span>{setting.phoneNumber}</span>
                </div>
              )}
              {setting?.email && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Mail size={16} /> <span>{setting.email}</span>
                </div>
              )}
              {setting?.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={16} /> <span>{setting.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Others</h3>
              <div className="grid grid-cols-1 text-gray-700">
                {links.map((link, idx) => (
                  <Link
                    href={link.route}
                    key={idx}
                    className="hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-primary px-6 md:px-10 py-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/80 text-center md:text-left">
          <p>
            © {currentYear}{" "}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              {setting?.name}
            </a>
            . All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://www.artistycode.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              ArtistyCode Studio
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
