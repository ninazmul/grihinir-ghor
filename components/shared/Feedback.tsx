"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import { Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

function Feedback({ setting }: { setting: ISettingSafe | null }) {
  const testimonials = setting?.testimonials?.feedbacks || [];
  const badge = setting?.testimonials?.badge || "Testimonials";
  const title = setting?.testimonials?.title || "What Our Students Say";
  const description =
    setting?.testimonials?.description ||
    "Real stories from learners who advanced their careers with our accredited online programs.";

  const stats = {
    totalEnrollment: setting?.testimonials?.totalEnrollment || "10k",
    successRate: setting?.testimonials?.totalSucceededStudents || "95",
    experts: setting?.testimonials?.totalIndustryExperts || "120",
  };

  return (
    <section
      aria-label="Student testimonials and statistics"
      className="w-full py-12 md:py-20 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            {badge}
          </span>

          <h2 className="text-2xl md:text-4xl font-extrabold text-primary">
            {title}
          </h2>

          <p
            className="max-w-3xl text-gray-700 text-base md:text-lg"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </motion.header>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {stats.totalEnrollment}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Enrollments</p>
          </div>

          <div className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {stats.successRate}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Student Success Rate</p>
          </div>

          <div className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {stats.experts}
            </p>
            <p className="text-sm text-gray-500 mt-1">Industry Experts</p>
          </div>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.length === 0
            ? // Placeholder cards when no testimonials available
              [1, 2, 3, 4].map((i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-white text-xl font-bold">
                    A
                  </div>
                  <p className="font-semibold text-gray-900">Student Name</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-gray-300" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    “This program helped me grow my skills and confidence.”
                  </p>
                </motion.article>
              ))
            : testimonials.map((feedback, idx) => {
                const firstLetter =
                  (feedback.name && feedback.name.charAt(0).toUpperCase()) ||
                  "?";
                const rating = Math.max(0, Math.min(5, feedback.rating || 0));

                return (
                  <motion.article
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ translateY: -6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4"
                  >
                    {/* Avatar */}
                    {feedback.photo ? (
                      <Image
                        src={feedback.photo}
                        alt={feedback.name || "Student"}
                        width={64}
                        height={64}
                        className="rounded-full object-cover w-16 h-16"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-primary">
                        {firstLetter}
                      </div>
                    )}

                    {/* Name */}
                    <p className="font-semibold text-gray-900">
                      {feedback.name || "Anonymous"}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                          aria-hidden
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    {feedback.comment && (
                      <p className="text-sm text-gray-600 text-justify">
                        {feedback.comment}
                      </p>
                    )}
                  </motion.article>
                );
              })}
        </motion.div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition"
          >
            Contact Us to Share Your Story
          </Link>

          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-95 transition"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Feedback;
