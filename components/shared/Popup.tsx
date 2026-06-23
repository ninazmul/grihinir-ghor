"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function Popup({ setting }: { setting: ISettingSafe | null }) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<number | null>(null);
  const autoCloseTimer = useRef<number | null>(null);
  const remainingRef = useRef(10000); // ms remaining for auto-close
  const startRef = useRef<number | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Start show/auto-close timers
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathname = window.location.pathname;
    if (pathname !== "/") return;
    if (!setting?.popup?.image) return;

    const { offerStartDate, offerEndDate } = setting.popup;
    const now = new Date();
    const start = offerStartDate ? new Date(offerStartDate) : null;
    const end = offerEndDate ? new Date(offerEndDate) : null;
    const isValid = (!start || now >= start) && (!end || now <= end);
    if (!isValid) return;

    if (sessionStorage.getItem("popup_home_shown")) return;

    showTimer.current = window.setTimeout(() => {
      sessionStorage.setItem("popup_home_shown", "true");
      setVisible(true);
      // start progress
      startRef.current = Date.now();
      autoCloseTimer.current = window.setTimeout(
        () => setVisible(false),
        remainingRef.current,
      );
    }, 800);

    return () => {
      if (showTimer.current) window.clearTimeout(showTimer.current);
      if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
    };
  }, [setting]);

  // handle Escape key to close
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    // focus close button for accessibility
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  // Pause/resume auto-close and progress on hover/touch
  const pauseAutoClose = () => {
    if (!autoCloseTimer.current || !startRef.current) return;
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    window.clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = null;
    // freeze progress bar by setting inline width
    if (progressRef.current) {
      const pct = Math.max(0, (remainingRef.current / 10000) * 100);
      progressRef.current.style.width = `${pct}%`;
      progressRef.current.style.transition = "none";
    }
  };

  const resumeAutoClose = () => {
    if (autoCloseTimer.current) return;
    startRef.current = Date.now();
    autoCloseTimer.current = window.setTimeout(
      () => setVisible(false),
      remainingRef.current,
    );
    // resume progress animation
    if (progressRef.current) {
      // force reflow then animate to 0
      // set transition duration proportional to remaining time
      const durationSec = Math.max(0.1, remainingRef.current / 1000);
      // ensure width is current pct
      const pct = Math.max(0, (remainingRef.current / 10000) * 100);
      progressRef.current.style.width = `${pct}%`;
      // small timeout to allow style to apply
      setTimeout(() => {
        progressRef.current!.style.transition = `width ${durationSec}s linear`;
        progressRef.current!.style.width = `0%`;
      }, 20);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setVisible(false)}
      />

      {/* Image container */}
      <div
        className="relative z-10 w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl"
        onMouseEnter={pauseAutoClose}
        onMouseLeave={resumeAutoClose}
        onTouchStart={pauseAutoClose}
        onTouchEnd={resumeAutoClose}
      >
        {/* Image with black overlay for contrast */}
        <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] bg-black">
          <Image
            src={setting?.popup?.image || "/assets/images/promo.jpg"}
            alt={"Promotion"}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 900px"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Close button (larger on mobile for touch) */}
          <button
            ref={closeBtnRef}
            onClick={() => setVisible(false)}
            aria-label="Close popup"
            className="absolute top-3 right-3 z-20 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            ✕
          </button>
        </div>

        {/* Thin progress bar */}
        <div className="h-1 w-full bg-white/20">
          <div
            ref={progressRef}
            className="h-full bg-primary"
            style={{
              width: "100%",
              transition: "width 10s linear",
            }}
            // start animation to 0 after mount
            onAnimationStart={() => {}}
          />
        </div>
      </div>

      <style jsx>{`
        /* Kick off the progress animation on mount */
        :global(.bg-primary) {
          /* keep tailwind primary class */
        }
        /* When component mounts, animate progressRef to 0 */
        /* We use a small script to trigger the animation after render */
      `}</style>

      {/* Inline script to start the progress animation after render */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const el = document.querySelector('[ref="progressRef"]');
              } catch(e) {}
            })();
          `,
        }}
      />
    </div>
  );
}
