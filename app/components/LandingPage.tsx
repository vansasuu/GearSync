"use client";
import { signIn } from "next-auth/react";
import HeroSlideshow from "@/app/components/HeroSlideshow";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      {/* ═══ NAVBAR ═══ */}
      <nav className="glass border-b border-white/5 px-6 sm:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tighter text-green-500">GEARSYNC</span>
          <div className="hidden sm:flex items-center gap-6">
            <a href="/explore" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">Explore Gear</a>
            <a href="/pros" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">CS2 Pros</a>
          </div>
        </div>
        <button
          onClick={() => signIn("discord")}
          className="bg-[#5865F2] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#4752c4] transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          Sign In
        </button>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-24 pb-20 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-8 animate-pulse-glow">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Discord Bot Live</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Track your gear.
            <br />
            <span className="text-green-500">Flex on Discord.</span>
          </h1>

          <p className="text-zinc-500 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-12">
            Set up your gaming gear profile once. Let anyone check your setup with a simple slash command.
          </p>

          <div className="flex items-center gap-4 justify-center flex-wrap">
            <button
              onClick={() => signIn("discord")}
              className="bg-[#5865F2] text-white text-base font-bold px-8 py-4 rounded-2xl hover:bg-[#4752c4] transition-all hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 flex items-center gap-2.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Login with Discord
            </button>
            <a
              href="/explore"
              className="border border-zinc-700 text-zinc-300 text-base font-semibold px-8 py-4 rounded-2xl hover:border-green-500 hover:text-white transition-all hover:-translate-y-0.5"
            >
              Explore Gear →
            </a>
          </div>
        </div>
      </div>

      {/* ═══ HERO SLIDESHOW ═══ */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pb-20 animate-fade-in-up stagger-2">
        <HeroSlideshow />
      </div>

      {/* ═══ BOT COMMANDS ═══ */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pb-24">
        <div className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-6">Discord Bot Commands</div>
        <div className="flex flex-col gap-3">
          {[
            { cmd: "/whichmouse @sassuan", result: "→ Razer DeathAdder V3 Pro ★ Maining" },
            { cmd: "/whichkeyboard @sassuan", result: "→ Wooting 60HE ★ Maining" },
            { cmd: "/setup @sassuan", result: "→ Full gear profile card" },
          ].map((item, i) => (
            <div
              key={item.cmd}
              className={`bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-6 py-4 flex items-center gap-5 flex-wrap hover:border-zinc-600 transition-all animate-fade-in-up stagger-${i + 4}`}
            >
              <span className="text-green-500 font-bold font-mono text-sm">{item.cmd}</span>
              <span className="text-zinc-500 text-sm">{item.result}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
