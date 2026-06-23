"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FAQ({ setting }: { setting: ISettingSafe | null }) {
  const faqs = setting?.faqs?.items || [];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  // Close all when route changes or setting removed
  useEffect(() => {
    setOpenIndex(null);
  }, [setting]);

  return (
    <section
      aria-label="Frequently asked questions"
      className="w-full bg-gray-50 py-12 md:py-20 px-4 sm:px-6 lg:px-12"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {setting?.faqs?.badge && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
              {setting.faqs.badge}
            </span>
          )}

          {setting?.faqs?.title && (
            <h2 className="mt-4 text-2xl md:text-4xl font-extrabold text-primary">
              {setting.faqs.title}
            </h2>
          )}

          {setting?.faqs?.description && (
            <p
              className="mt-3 max-w-3xl mx-auto text-gray-700 text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: setting.faqs.description }}
            />
          )}
        </div>

        {/* Accordion */}
        <div ref={containerRef} className="space-y-4">
          {faqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-600">
              No FAQs available at the moment.
            </div>
          ) : (
            faqs.map((item, index) => {
              const isOpen = openIndex === index;
              const contentId = `faq-content-${index}`;
              const buttonId = `faq-button-${index}`;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    id={buttonId}
                    aria-controls={contentId}
                    aria-expanded={isOpen}
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="flex-1 text-left">
                      <span className="block text-base md:text-lg font-semibold text-gray-900">
                        {item.question}
                      </span>
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ maxHeight: 0, opacity: 0 }}
                        animate={{ maxHeight: 500, opacity: 1 }}
                        exit={{ maxHeight: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="px-5 pb-5 text-gray-600 leading-relaxed overflow-hidden"
                      >
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {/* Render HTML safely if provided, otherwise plain text */}
                          {typeof item.answer === "string" ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                          ) : (
                            <div>{item.answer}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
