"use client";
import { useEffect, useRef, useState } from "react";

interface SlideItem {
  name: string;
  category: string;
  imageUrl?: string;
  count?: number;
}

const CATEGORY_COLORS: Record<string, { accent: string; bg: string }> = {
  Mouse:      { accent: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
  Keyboard:   { accent: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Headset:    { accent: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  Monitor:    { accent: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Mousepad:   { accent: "#06b6d4", bg: "rgba(6,182,212,0.12)"  },
  Audio:      { accent: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  Controller: { accent: "#f97316", bg: "rgba(249,115,22,0.12)" },
};

function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { accent: "#22c55e", bg: "rgba(34,197,94,0.12)" };
}

function SlideshowInner({ slides }: { slides: SlideItem[] }) {
  const [current, setCurrent]   = useState(0);
  const [paused, setPaused]     = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total    = slides.length;
  const DURATION = 5000;
  const TICK     = 50;

  const goTo = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
  };

  const next = () => goTo((current + 1) % total);
  const back = () => goTo((current - 1 + total) % total);

  // Auto-advance
  useEffect(() => {
    if (paused || total === 0) return;
    intervalRef.current = setInterval(next, DURATION);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [current, paused, total]);

  // Progress bar
  useEffect(() => {
    if (paused || total === 0) return;
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (TICK / DURATION) * 100, 100));
    }, TICK);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, paused, total]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];
  const col   = getColor(slide.category);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl group"
      style={{ height: "420px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── BACKGROUND GLOW ── */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 65% 50%, ${col.accent}20 0%, transparent 70%),
                       radial-gradient(ellipse 50% 80% at 20% 20%, ${col.accent}0d 0%, transparent 60%),
                       #060606`,
        }}
      />

      {/* ── GRID PATTERN ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(${col.accent}80 1px, transparent 1px), linear-gradient(90deg, ${col.accent}80 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      />

      {/* ── SLIDE CONTENT ── */}
      <div className="relative h-full flex items-center px-10 sm:px-16 gap-10">

        {/* ── TEXT SIDE ── */}
        <div className="flex-1 min-w-0 z-10" key={`text-${current}`} style={{ animation: "gsSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>

          {/* Category badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-5"
            style={{ background: col.bg, color: col.accent, border: `1px solid ${col.accent}44` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.accent, display: "inline-block" }} />
            {slide.category}
          </div>

          {/* Title */}
          <h2
            className="text-3xl sm:text-[42px] font-black tracking-tighter leading-[1.05] text-white mb-4"
            style={{ textShadow: `0 0 80px ${col.accent}30` }}
          >
            {slide.name}
          </h2>

          {/* User count */}
          {slide.count !== undefined && slide.count > 0 && (
            <div className="flex items-center gap-2.5 mb-7">
              <div className="flex -space-x-1.5">
                {[...Array(Math.min(3, slide.count))].map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-[1.5px] border-black"
                    style={{ background: `${col.accent}55` }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-500">
                <span className="font-black" style={{ color: col.accent }}>
                  {slide.count.toLocaleString()}
                </span>{" "}
                players using this
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="/explore"
              className="text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{ background: col.accent, color: "#000" }}
            >
              Explore Gear →
            </a>
            <a
              href="/pros"
              className="text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest text-zinc-400 transition-all hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Pro Setups
            </a>
          </div>
        </div>

        {/* ── IMAGE SIDE ── */}
        <div
          className="hidden sm:flex items-center justify-center flex-shrink-0"
          style={{ width: 260, height: 260 }}
          key={`img-${current}`}
        >
          {slide.imageUrl && !slide.imageUrl.startsWith("ERROR") ? (
            <img
              src={slide.imageUrl}
              alt={slide.name}
              className="max-w-full max-h-full object-contain"
              style={{
                animation: "gsFloat 7s ease-in-out infinite, gsImgIn 0.6s cubic-bezier(0.16,1,0.3,1) both",
                filter: `drop-shadow(0 0 50px ${col.accent}55)`,
              }}
            />
          ) : (
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center text-5xl"
              style={{ background: col.bg, border: `1px solid ${col.accent}33` }}
            >
              🎮
            </div>
          )}
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 z-20">
        <div
          className="h-full"
          style={{ width: `${progress}%`, background: col.accent, transition: "none" }}
        />
      </div>

      {/* ── DOTS ── */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 z-20">
        {slides.map((s, i) => {
          const c = getColor(s.category);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === current ? 22 : 6,
                height: 6,
                background: i === current ? c.accent : "rgba(255,255,255,0.12)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          );
        })}
      </div>

      {/* ── ARROWS ── */}
      <button
        onClick={back}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Previous"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Next"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      {/* ── SLIDE COUNTER ── */}
      <div className="absolute top-5 right-6 z-20 font-black text-xs tracking-widest text-zinc-600">
        <span style={{ color: col.accent }}>{String(current + 1).padStart(2, "0")}</span>
        <span className="mx-1 text-zinc-700">/</span>
        {String(total).padStart(2, "0")}
      </div>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes gsSlideIn {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gsImgIn {
          from { opacity: 0; transform: scale(0.82) translateX(20px); }
          to   { opacity: 1; transform: scale(1) translateX(0); }
        }
        @keyframes gsFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%  { transform: translateY(-10px) rotate(1.2deg); }
          70%  { transform: translateY(-5px) rotate(-0.6deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Self-fetching export ───
export default function HeroSlideshow() {
  const [slides, setSlides] = useState<SlideItem[]>([]);

  useEffect(() => {
    fetch("/api/slideshow")
      .then(r => r.json())
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  if (slides.length === 0) return null;
  return <SlideshowInner slides={slides} />;
}
