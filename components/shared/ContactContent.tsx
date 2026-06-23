"use client";

import { useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function ContactContent({
  settings,
}: {
  settings: ISettingSafe | null;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast.loading("Sending message...", { id: "contact" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      toast.success(data.message || "Message sent successfully!", {
        id: "contact",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong.", { id: "contact" });
    } finally {
      setLoading(false);
      setFocused(null);
    }
  };

  const inputBaseClasses =
    "w-full rounded-md border px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition";

  const inputBorderClasses =
    "border-gray-300 dark:border-gray-600 focus:outline-none";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or need support? Send us a message and our team will
            respond shortly.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact card */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border"
            style={{ borderColor: "rgba(124,10,2,0.12)" }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Contact Information
            </h2>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              {settings?.email && (
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Mail size={20} className="text-primary" />
                  </div>

                  {/* Email Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-medium hover:underline break-words truncate block"
                      title={settings.email} // shows full email on hover
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {settings?.phoneNumber && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a
                      href={`tel:${settings.phoneNumber}`}
                      className="font-medium hover:underline"
                    >
                      {settings.phoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {settings?.address && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <div className="font-medium">{settings.address}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Follow Us
              </h3>
              <div className="flex flex-wrap gap-3">
                {settings?.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="p-3 rounded-full shadow-sm hover:scale-105 transition w-10 h-10 flex items-center justify-center bg-primary/10"
                  >
                    <FaFacebook size={16} className="text-primary" />
                  </a>
                )}
                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="p-3 rounded-full shadow-sm hover:scale-105 transition w-10 h-10 flex items-center justify-center bg-primary/10"
                  >
                    <FaInstagram size={16} className="text-primary" />
                  </a>
                )}
                {settings?.twitter && (
                  <a
                    href={settings.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="p-3 rounded-full shadow-sm hover:scale-105 transition w-10 h-10 flex items-center justify-center bg-primary/10"
                  >
                    <FaTwitter size={16} className="text-primary" />
                  </a>
                )}
                {settings?.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="p-3 rounded-full shadow-sm hover:scale-105 transition w-10 h-10 flex items-center justify-center bg-primary/10"
                  >
                    <FaYoutube size={16} className="text-primary" />
                  </a>
                )}
                {settings?.facebookGroup && (
                  <a
                    href={settings.facebookGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Community"
                    className="p-3 rounded-full shadow-sm hover:scale-105 transition w-10 h-10 flex items-center justify-center bg-primary/10"
                  >
                    <Users size={16} className="text-primary" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* CONTACT FORM */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 shadow-lg border space-y-6"
            style={{ borderColor: `primary/40` }}
          >
            <h2
              className="text-2xl sm:text-2xl font-bold"
              style={{ color: `primary` }}
            >
              Send a Message
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                className={`${inputBaseClasses} ${inputBorderClasses}`}
                style={
                  focused === "name"
                    ? {
                        boxShadow: `0 0 0 4px primary22`,
                        borderColor: `primary`,
                      }
                    : {}
                }
                aria-label="Your Name"
              />

              <input
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={`${inputBaseClasses} ${inputBorderClasses}`}
                style={
                  focused === "email"
                    ? {
                        boxShadow: `0 0 0 4px primary22`,
                        borderColor: `primary`,
                      }
                    : {}
                }
                aria-label="Your Email"
              />

              <textarea
                rows={5}
                placeholder="Your Message"
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused(null)}
                className={`${inputBaseClasses} ${inputBorderClasses} resize-none`}
                style={
                  focused === "message"
                    ? {
                        boxShadow: `0 0 0 4px primary22`,
                        borderColor: `primary`,
                      }
                    : {}
                }
                aria-label="Your Message"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-3 rounded-md font-semibold text-white transition transform ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.02] hover:shadow-lg"
              }`}
              style={{ backgroundColor: `primary` }}
              aria-disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
