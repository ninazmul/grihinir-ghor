"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Globe, CheckCircle } from "lucide-react";
import Link from "next/link";

function Hero({ setting }: { setting: ISettingSafe | null }) {
  // Static fallback data
  const fallback = {
    name: "NRB Virtual School",
    hero: {
      title: "Shaping Tomorrow’s Leaders, With Flexible Online Programs!",
      description:
        "Modern online learning designed for Canada. Accessible programs, accredited standards, and student success.",
      image: "/assets/images/hero-bg.png",
    },
    phoneNumber: "+1 (416) 43‑4040‬",
  };

  const safeSetting = setting || fallback;

  const titleParts = useMemo(() => {
    return (
      safeSetting.hero?.title?.split(/[.,]/).filter(Boolean) || [
        "Shaping Tomorrow’s Leaders",
        "With Flexible Online Programs!",
      ]
    );
  }, [safeSetting.hero?.title]);

  return (
    <section
      aria-label="Hero"
      className="relative w-full min-h-[620px] md:min-h-[720px] overflow-hidden"
    >
      {/* Background image */}
      <Image
        src={safeSetting.hero?.image || fallback.hero.image}
        alt={`${safeSetting.name} background`}
        fill
        className="object-cover"
        priority
      />

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Brand gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/10 mix-blend-overlay pointer-events-none" />

      {/* Centered content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full 
                     bg-white/20 backdrop-blur-md border border-white/30 
                     text-white font-semibold shadow-sm mb-6"
        >
          <GraduationCap size={18} />
          Welcome to {safeSetting.name}!
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight mb-4">
          {titleParts.map((part, i) => (
            <motion.span
              key={i}
              className="block mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i }}
            >
              {i === 1 ? (
                <span className="text-primary px-2 rounded-sm">
                  {part.trim()}
                </span>
              ) : (
                part.trim()
              )}
            </motion.span>
          ))}
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl text-gray-100 text-base md:text-lg lg:text-xl font-light mb-8"
          dangerouslySetInnerHTML={{
            __html:
              setting?.hero?.description ||
              "Flexible schedules, certified teachers, and a supportive community — designed for learners across Canada.",
          }}
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 
                       rounded-full border border-white/30 bg-white/10 backdrop-blur-sm 
                       text-white hover:bg-white/20 transition font-semibold"
          >
            <BookOpen size={16} />
            Browse Courses
          </Link>
        </motion.div>

        {/* Features */}
        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl"
        >
          <li className="flex items-start gap-3 rounded-lg p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white px-3">
              <CheckCircle size={18} />
            </div>
            <div className="text-left">
              <div className="text-sm text-white/90 font-semibold">
                Accredited Programs
              </div>
              <div className="text-xs text-white/70">
                Provincially recognized diplomas & certificates
              </div>
            </div>
          </li>

          <li className="flex items-start gap-3 rounded-lg p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white px-3">
              <Globe size={18} />
            </div>
            <div className="text-left">
              <div className="text-sm text-white/90 font-semibold">
                Flexible Learning
              </div>
              <div className="text-xs text-white/70">
                Self-paced and live classes to fit your schedule
              </div>
            </div>
          </li>

          <li className="flex items-start gap-3 rounded-lg p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white px-3">
              <GraduationCap size={18} />
            </div>
            <div className="text-left">
              <div className="text-sm text-white/90 font-semibold">
                Student Support
              </div>
              <div className="text-xs text-white/70">
                Advisors, tutors, and career guidance
              </div>
            </div>
          </li>
        </motion.ul>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-8 text-sm text-white/80"
        >
          <span className="font-medium">Questions?</span> Call us:{" "}
          <span className="font-semibold">{safeSetting.phoneNumber}</span>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
