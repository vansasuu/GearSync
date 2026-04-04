"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { getGear, getGearHistory } from "@/app/actions/gearActions";
import { useEffect, useState } from "react";
import HeroSlideshow from "@/app/components/HeroSlideshow";
import LandingPage from "@/app/components/LandingPage";
import AddGearForm from "@/app/components/AddGearForm";
import ProfileCard from "@/app/components/ProfileCard";
import LinkedAccounts from "@/app/components/LinkedAccounts";
import GearCard from "@/app/components/GearCard";
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ACTION_LABELS: Record<string, { icon: string; color: string; label: string }> = {
  added:            { icon: "+", color: "text-green-500",  label: "Added" },
  wishlist_added:   { icon: "♡", color: "text-purple-400", label: "Wishlisted" },
  wishlist_imported:{ icon: "📥", color: "text-purple-400", label: "Imported" },
  removed:          { icon: "−", color: "text-red-400",    label: "Removed" },
  set_main:         { icon: "★", color: "text-yellow-400", label: "Set Main" },
};

export default function Home() {
  const { data: session } = useSession();
  const [myGear, setMyGear] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeView, setActiveView] = useState<"setup" | "wishlist" | "history">("setup");
  const [gearHistory, setGearHistory] = useState<any[]>([]);

  const loadData = async () => {
    const [data, history] = await Promise.all([getGear(), getGearHistory()]);
    setMyGear(data);
    setGearHistory(history);
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const setupGear = myGear.filter(g => !g.isWishlist);
  const wishlistGear = myGear.filter(g => g.isWishlist);
  const activeGear = activeView === "wishlist" ? wishlistGear : setupGear;
  const mainingCount = setupGear.filter((g) => g.isMain).length;
  const categories = ["All", ...Array.from(new Set(activeGear.map(g => g.category)))];
  const filteredGear = filterCategory === "All" ? activeGear : activeGear.filter(g => g.category === filterCategory);

  // ─── LANDING PAGE (NOT LOGGED IN) ───
  if (!session) {
    return <LandingPage />;
  }

  // ─── DASHBOARD (LOGGED IN) ───
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      {/* ═══ NAVBAR ═══ */}
      <nav className="glass w-full h-16 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter text-green-500">GEARSYNC</h1>
          <div className="hidden sm:flex items-center gap-6">
            <a href="/explore" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">Explore Gear</a>
            <a href="/pros" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">CS2 Pros</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/u/${session.user?.name}`} className="nav-link text-sm font-semibold text-green-500 hover:text-green-400 transition">
            My Profile ↗
          </a>
          <button
            onClick={() => signOut()}
            className="text-sm border border-zinc-700 px-4 py-2 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all font-semibold text-zinc-400"
          >
            Sign Out
          </button>
          <Image src={session.user?.image || "/favicon.ico"} width={36} height={36} className="w-9 h-9 rounded-xl border-2 border-zinc-700" alt="profile" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-64px)]">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="md:col-span-4 border-r border-white/5 p-6 flex flex-col gap-6">

          {/* Profile Card */}
          <ProfileCard
            user={{ name: session.user?.name, image: session.user?.image }}
            setupCount={setupGear.length}
            mainingCount={mainingCount}
            wishlistCount={wishlistGear.length}
          />

          {/* Add Gear */}
          <AddGearForm onAdd={loadData} />

          {/* Linked Accounts */}
          <LinkedAccounts />
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <section className="md:col-span-8 p-6">
          {/* ═══ VIEW TABS ═══ */}
          <div className="flex items-center gap-2 mb-8 animate-fade-in-up">
            {(["setup", "wishlist", "history"] as const).map((view) => (
              <button
                key={view}
                onClick={() => { setActiveView(view); setFilterCategory("All"); }}
                className={`relative px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden ${
                  activeView === view
                    ? view === "wishlist"
                      ? "text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50"
                      : view === "history"
                      ? "text-white ring-1 ring-zinc-500/50 bg-[#111]"
                      : "text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)] ring-1 ring-green-500/30"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {activeView === view && (
                  <div className={`absolute inset-0 opacity-10 ${
                    view === 'setup' ? 'bg-green-500' : view === 'wishlist' ? 'bg-purple-500' : 'bg-white'
                  }`}></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {view === "setup" ? "Setup" : view === "wishlist" ? "Wishlist" : "History"}
                  {view !== "history" && (
                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] ${
                      activeView === view ? "bg-black/30" : "bg-white/5"
                    }`}>
                      {view === "setup" ? setupGear.length : wishlistGear.length}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* ═══ HISTORY VIEW ═══ */}
          {activeView === "history" && (
            <div className="animate-fade-in-up">
              {gearHistory.length === 0 ? (
                <div className="border-2 border-dashed border-[#1a1a1a] rounded-2xl py-24 text-center text-zinc-600 text-sm font-medium">
                  No activity yet. Start adding gear to see your history.
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  {gearHistory.map((entry: any, i: number) => {
                    const meta = ACTION_LABELS[entry.action] ?? { icon: "·", color: "text-zinc-500", label: entry.action };
                    return (
                      <div key={entry._id} className={`flex items-start gap-4 py-4 ${i < gearHistory.length - 1 ? "border-b border-[#111]" : ""}`}>
                        <div className={`text-base font-black w-6 text-center flex-shrink-0 mt-0.5 ${meta.color}`}>{meta.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{entry.gearName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                            {entry.category !== "Import" && (
                              <span className="text-[10px] text-zinc-600 font-bold">· {entry.category}</span>
                            )}
                            {entry.detail && (
                              <span className="text-[10px] text-zinc-600">· {entry.detail}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-700 font-bold flex-shrink-0 mt-1">{timeAgo(entry.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ CATEGORY FILTER PILLS (setup + wishlist views) ═══ */}
          {activeView !== "history" && activeGear.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up stagger-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    filterCategory === cat
                      ? activeView === "wishlist"
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-green-500 text-black shadow-lg shadow-green-500/20"
                      : "bg-[#111] text-zinc-500 border border-[#1a1a1a] hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ═══ GEAR CARDS ═══ */}
            {filteredGear.map((item, i) => (
              <GearCard key={item._id} item={item} index={i} onUpdate={loadData} />
            ))}                   )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredGear.length === 0 && (
              <div className="col-span-full border border-dashed border-[#222] bg-[#0a0a0a] rounded-2xl py-24 flex flex-col items-center justify-center gap-4 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-[#222]">
                  <span className="text-2xl opacity-50">🕹️</span>
                </div>
                <div className="text-center">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">No Gear Found</h3>
                  <p className="text-zinc-500 text-xs">
                    {activeView === "wishlist"
                      ? "Your wishlist is empty. Add equipment to track for later."
                      : "Your setup is empty. Add your hardware to get started."}
                  </p>
                </div>
              </div>
            )}
          </div>
          )}
        </section>
      </div>
    </main>
  );
}
