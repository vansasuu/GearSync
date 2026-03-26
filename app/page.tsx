"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { addGear, getGear, deleteGear, toggleMain, updateGearImage, getGearReviews, getGearPrice, getGearHistory } from "@/app/actions/gearActions";
import { useEffect, useState } from "react";
import HeroSlideshow from "@/app/components/HeroSlideshow";

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
  const [steamId, setSteamId] = useState("");
  const [valorantId, setValorantId] = useState("");
  const [savedSteamId, setSavedSteamId] = useState("");
  const [savedValorantId, setSavedValorantId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [steamStats, setSteamStats] = useState<any>(null);
  const [editingAccounts, setEditingAccounts] = useState(false);
  const [reviewGearId, setReviewGearId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeView, setActiveView] = useState<"setup" | "wishlist" | "history">("setup");
  const [gearHistory, setGearHistory] = useState<any[]>([]);
  const [checkingPriceId, setCheckingPriceId] = useState<string | null>(null);
  const [isWishlistAdd, setIsWishlistAdd] = useState(false);

  const loadData = async () => {
    const [data, history] = await Promise.all([getGear(), getGearHistory()]);
    setMyGear(data);
    setGearHistory(history);
  };

  const handleCheckPrice = async (id: string, name: string) => {
    setCheckingPriceId(id);
    await getGearPrice(id, name);
    setCheckingPriceId(null);
    loadData();
  };

  useEffect(() => {
    if (session) {
      loadData();
      fetch("/api/user/link")
        .then((r) => r.json())
        .then((data) => {
          if (data.steamId) { setSteamId(data.steamId); setSavedSteamId(data.steamId); }
          if (data.valorantId) { setValorantId(data.valorantId); setSavedValorantId(data.valorantId); }
          if (!data.steamId && !data.valorantId) { setEditingAccounts(true); }
          if (session.user?.name) {
            fetch(`/api/user/stats?username=${encodeURIComponent(session.user.name)}`)
              .then(r => r.json()).then(stats => setSteamStats(stats));
          }
        });
    }
  }, [session]);

  const handleLink = async () => {
    setLinking(true);
    await fetch("/api/user/link", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamId, valorantId }),
    });
    setLinking(false);
    setLinked(true);
    setTimeout(() => setLinked(false), 2000);
  };

  const setupGear = myGear.filter(g => !g.isWishlist);
  const wishlistGear = myGear.filter(g => g.isWishlist);
  const activeGear = activeView === "wishlist" ? wishlistGear : setupGear;
  const mainingCount = setupGear.filter((g) => g.isMain).length;
  const categories = ["All", ...Array.from(new Set(activeGear.map(g => g.category)))];
  const filteredGear = filterCategory === "All" ? activeGear : activeGear.filter(g => g.category === filterCategory);

  // ─── LANDING PAGE (NOT LOGGED IN) ───
  if (!session) {
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
          <img src={session.user?.image || ""} className="w-9 h-9 rounded-xl border-2 border-zinc-700" alt="profile" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-64px)]">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="md:col-span-4 border-r border-white/5 p-6 flex flex-col gap-6">

          {/* Profile Card */}
          <div className="relative bg-[#0a0a0a] rounded-2xl p-6 flex flex-col items-center gap-5 border border-[#1a1a1a] overflow-hidden group hover:border-[#333] transition-colors duration-500">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:bg-green-500/20" />
            
            <div className="relative z-10">
              <img src={session.user?.image || ""} alt="avatar" className="w-16 h-16 rounded-2xl border border-[#333] shadow-2xl transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0a] animate-pulse"></div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="font-black text-white text-xl tracking-tight">{session.user?.name}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-widest font-semibold font-mono">
                gearsync.gg/u/{session.user?.name}
              </div>
            </div>
            
            <div className="w-full bg-black/50 backdrop-blur-md rounded-xl px-4 py-4 flex justify-between items-center border border-white/5 relative z-10">
              <div className="text-center flex-1">
                <div className="text-xl font-black text-white drop-shadow-md">{setupGear.length}</div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Gear</div>
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{mainingCount}</div>
                <div className="text-[9px] opacity-80 text-green-500/70 font-bold uppercase tracking-[0.2em] mt-0.5">Maining</div>
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]">{wishlistGear.length}</div>
                <div className="text-[9px] opacity-80 text-purple-400/70 font-bold uppercase tracking-[0.2em] mt-0.5">Wishlist</div>
              </div>
            </div>
          </div>

          {/* Add Gear */}
          <div className="animate-fade-in-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Add Gear</div>
            </div>
            <form
              action={async (formData) => {
                formData.set("isWishlist", isWishlistAdd ? "true" : "false");
                await addGear(formData);
                setIsWishlistAdd(false);
                loadData();
              }}
              className="flex flex-col gap-3 relative"
            >
              <div className="relative group/input">
                <input
                  name="name"
                  placeholder="e.g. Razer DeathAdder V3 Pro"
                  className="w-full bg-[#0a0a0a] border border-[#222] p-4 rounded-xl outline-none focus:border-green-500 focus:bg-black transition-all text-sm text-white placeholder:text-zinc-700 block"
                  required
                />
              </div>
              
              <div className="relative">
                <select name="category" className="w-full appearance-none bg-[#0a0a0a] border border-[#222] p-4 rounded-xl outline-none focus:border-green-500 focus:bg-black transition-all text-sm text-zinc-300">
                  <option value="Mouse">Mouse</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Headset">Headset</option>
                  <option value="Mousepad">Mousepad</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Audio">Audio</option>
                  <option value="Controller">Controller</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 text-xs">▼</div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer group mt-1 mb-1">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" checked={isWishlistAdd} onChange={() => setIsWishlistAdd(v => !v)} />
                  <div className="w-5 h-5 rounded border border-[#333] bg-[#0a0a0a] peer-checked:border-purple-500 peer-checked:bg-purple-500/20 transition-all"></div>
                  <div className="absolute text-purple-400 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none text-xs font-black">✓</div>
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">Add to Wishlist instead</span>
              </label>

              <button
                type="submit"
                className={`group relative overflow-hidden font-black py-4 rounded-xl transition-all uppercase text-[11px] tracking-[0.2em] ${
                  isWishlistAdd
                    ? "bg-purple-600 text-white hover:bg-purple-500"
                    : "bg-green-500 text-black hover:bg-green-400"
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>{isWishlistAdd ? "Add to Wishlist" : "Add to Collection"}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
                {/* Button hover glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isWishlistAdd ? 'bg-gradient-to-r from-purple-400 to-purple-600 blur-xl' : 'bg-gradient-to-r from-green-400 to-green-300 blur-xl'}`}></div>
              </button>
            </form>
          </div>

          {/* Linked Accounts */}
          <div className="animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Linked Accounts</div>
              {(savedSteamId || savedValorantId) && !editingAccounts && (
                <button
                  onClick={() => setEditingAccounts(true)}
                  className="text-xs text-zinc-600 hover:text-zinc-300 transition font-bold uppercase tracking-widest"
                >✏ Edit</button>
              )}
            </div>

            {(savedSteamId || savedValorantId) && !editingAccounts ? (
              <div className="flex flex-col gap-3">
                {/* Steam card with game hours */}
                {savedSteamId && (
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
                    <a
                      href={steamStats?.steam?.profileUrl || `https://steamcommunity.com/profiles/${savedSteamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#111] transition group"
                    >
                      <svg viewBox="0 0 48 48" className="w-6 h-6 flex-shrink-0" fill="currentColor">
                        <path className="text-zinc-400 group-hover:text-white transition" fill="currentColor" d="M24 4C12.95 4 4 12.95 4 24c0 9.26 6.19 17.1 14.72 19.54L22 29.62A6 6 0 0 1 24 18a6 6 0 0 1 6 6 6 6 0 0 1-4.37 5.78l-3.79 9.14A20.06 20.06 0 0 0 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm-8.5 30.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Steam</div>
                        <div className="text-sm font-bold text-white truncate">{steamStats?.steam?.steamName || "Steam Account"}</div>
                      </div>
                      <span className="text-zinc-600 group-hover:text-zinc-300 transition text-sm">↗</span>
                    </a>
                    {steamStats?.steam?.gameHours && (
                      <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border-t border-[#1a1a1a]">
                        {[
                          { key: "cs2", label: "CS2", color: "text-yellow-500" },
                          { key: "pubg", label: "PUBG", color: "text-orange-500" },
                          { key: "r6", label: "R6 Siege", color: "text-blue-400" },
                          { key: "apex", label: "Apex", color: "text-red-500" },
                        ].filter(g => steamStats.steam.gameHours[g.key] > 0).map(g => (
                          <div key={g.key} className="bg-[#0a0a0a] px-4 py-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{g.label}</span>
                            <span className={`text-sm font-black ${g.color}`}>{steamStats.steam.gameHours[g.key].toLocaleString()}h</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Valorant card */}
                {savedValorantId && (
                  <a
                    href={`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(savedValorantId)}/overview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3.5 hover:border-zinc-600 transition-all group"
                  >
                    <span className="text-lg flex-shrink-0">🔫</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valorant</div>
                      <div className="text-sm font-bold text-white truncate">{savedValorantId}</div>
                    </div>
                    {steamStats?.valorant?.rank && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-red-400">{steamStats.valorant.rank}</div>
                        <div className="text-[10px] text-zinc-500">{steamStats.valorant.rr} RR</div>
                      </div>
                    )}
                    <span className="text-zinc-600 group-hover:text-zinc-300 transition text-sm">↗</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase">Steam ID</label>
                  <input value={steamId} onChange={(e) => setSteamId(e.target.value)} placeholder="76561198XXXXXXXXX"
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-3.5 rounded-xl outline-none focus:border-green-500 transition-all text-sm text-white placeholder:text-zinc-700" />
                  <p className="text-xs text-zinc-600">Find at steamid.io</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase">Valorant ID</label>
                  <input value={valorantId} onChange={(e) => setValorantId(e.target.value)} placeholder="name#tag"
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-3.5 rounded-xl outline-none focus:border-green-500 transition-all text-sm text-white placeholder:text-zinc-700" />
                </div>
                <button
                  onClick={async () => {
                    await handleLink();
                    setSavedSteamId(steamId); setSavedValorantId(valorantId); setEditingAccounts(false);
                    if (session?.user?.name) {
                      fetch(`/api/user/stats?username=${encodeURIComponent(session.user.name)}`)
                        .then(r => r.json()).then(s => setSteamStats(s));
                    }
                  }}
                  disabled={linking}
                  className="border border-zinc-700 text-zinc-300 font-bold py-3 rounded-xl hover:border-green-500 hover:text-green-500 transition-all uppercase text-xs tracking-widest"
                >
                  {linked ? "✓ Saved!" : linking ? "Saving..." : "Save Accounts"}
                </button>
                {editingAccounts && (
                  <button onClick={() => setEditingAccounts(false)} className="text-xs text-zinc-600 hover:text-zinc-300 transition uppercase tracking-widest">Cancel</button>
                )}
              </div>
            )}
          </div>
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
          {activeView !== "history" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGear.map((item, i) => (
              <div
                key={item._id}
                className={`gear-card rounded-2xl overflow-hidden group relative flex flex-col transition-all duration-500 animate-fade-in-up stagger-${(i % 6) + 1} bg-gradient-to-b from-[#121212] to-[#080808] border ${
                  item.isWishlist
                    ? "border-purple-900/30 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                    : item.isMain
                    ? "border-green-900/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                    : "border-[#1a1a1a] hover:border-[#333] hover:shadow-2xl"
                }`}
              >
                {/* Accent Top Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 z-10 opacity-50 group-hover:opacity-100 transition-opacity ${
                  item.isWishlist ? "bg-gradient-to-r from-purple-600/0 via-purple-500 to-purple-600/0"
                  : item.isMain ? "bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"
                  : ""
                }`} />

                {/* IMAGE STAGE */}
                <div className="relative w-full h-48 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center p-6 border-b border-[#222]/50 overflow-hidden">
                  {/* Subtle pedestal glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full blur-2xl z-0 transition-opacity duration-700 opacity-20 group-hover:opacity-60 ${
                    item.isWishlist ? "bg-purple-500" : (item.isMain ? "bg-green-500" : "bg-white/10")
                  }`} />
                  
                  {item.imageUrl ? (
                    item.imageUrl.startsWith("ERROR_") ? (
                      <div className="w-full h-full bg-red-950/20 flex p-4 items-center justify-center text-xs text-red-400 font-bold z-10 text-center break-words">{item.imageUrl}</div>
                    ) : (
                      <img src={item.imageUrl} alt={item.name} className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                    )
                  ) : (
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-zinc-800">
                      <span className="text-4xl mb-2 opacity-50">📷</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                    </div>
                  )}
                  
                  {/* Image Edit Button */}
                  <button
                    onClick={() => { setEditingImageId(item._id); setEditImageUrl(item.imageUrl || ""); }}
                    className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs p-2 rounded-lg transition-all hover:bg-white hover:text-black font-bold"
                    title="Change image URL"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                </div>

                {/* Inline image URL editor */}
                {editingImageId === item._id && (
                  <div className="px-4 py-3 bg-[#0a0a0a] flex gap-2 border-b border-[#222] animate-fade-in z-20">
                    <input autoFocus value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Paste image URL..."
                      className="flex-1 bg-[#111] border border-[#333] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-green-500 transition placeholder:text-zinc-600" />
                    <button
                      onClick={async () => { await updateGearImage(item._id, editImageUrl); setEditingImageId(null); setEditImageUrl(""); loadData(); }}
                      className="bg-green-500 text-black text-[10px] uppercase font-black px-3 rounded-lg hover:bg-green-400 transition"
                    >Save</button>
                    <button onClick={() => { setEditingImageId(null); setEditImageUrl(""); }}
                      className="text-zinc-500 text-xs px-2 hover:text-white transition">✕</button>
                  </div>
                )}

                {/* DETAILS CONTAINER */}
                <div className="p-5 flex-1 flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] ${
                      item.isWishlist
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : item.isMain
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-white/5 text-zinc-400 border border-white/10"
                    }`}>
                      {item.category}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {item.isWishlist ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Wishlist</span>
                        </div>
                      ) : (
                        item.isMain && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-green-400">Main</span>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => { deleteGear(item._id); loadData(); }}
                        className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-500 transition-colors"
                        title="Delete Gear"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mb-1.5 leading-snug tracking-tight group-hover:text-green-400 transition-colors duration-300">{item.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    {item.price ? (
                      <a
                        href={item.priceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-black text-green-400/80 hover:text-green-300 transition-colors inline-flex items-center gap-1"
                      >
                        {item.price}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCheckPrice(item._id, item.name)}
                        disabled={checkingPriceId === item._id}
                        className="text-[10px] font-bold text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-50 uppercase tracking-widest inline-flex items-center gap-1"
                      >
                        {checkingPriceId === item._id ? "Checking..." : "Check Price"}
                        {!checkingPriceId && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                      </button>
                    )}
                  </div>

                  <div className="mt-auto flex gap-2 pt-2 border-t border-white/5">
                    {!item.isWishlist && (
                      <button
                        onClick={async () => { await toggleMain(item._id, item.category); loadData(); }}
                        className={`flex-1 text-[10px] font-black py-2.5 rounded-lg border transition-all uppercase tracking-widest ${
                          item.isMain
                            ? "border-green-500/30 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                            : "border-[#333] text-zinc-400 hover:bg-[#1a1a1a] hover:text-white"
                        }`}
                      >
                        {item.isMain ? "★ Maining" : "Set Main"}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (reviewGearId === item._id) { setReviewGearId(null); return; }
                        setReviewGearId(item._id);
                        setLoadingReviews(true);
                        const res = await getGearReviews(item.name);
                        setReviews(res);
                        setLoadingReviews(false);
                      }}
                      className="px-4 text-[10px] font-black rounded-lg border border-[#333] text-zinc-400 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all uppercase tracking-widest"
                    >Reviews</button>
                  </div>
                </div>

                {/* REVIEWS DRAWER */}
                {reviewGearId === item._id && (
                  <div className="px-5 pb-5 pt-0 animate-fade-in relative z-10 bg-[#0d0d0d]">
                    <div className="border-t border-[#222] pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Web Reviews</span>
                      </div>
                      {loadingReviews ? (
                        <div className="text-xs text-zinc-500 animate-pulse font-medium">Fetching analysis...</div>
                      ) : reviews?.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {reviews.map((r: any, i: number) => (
                            <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block group/review bg-[#111] p-3 rounded-xl border border-[#222] hover:border-blue-500/30 transition-colors">
                              <div className="text-[11px] font-black text-white group-hover/review:text-blue-400 transition-colors mb-1 line-clamp-1">{r.title}</div>
                              <div className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{r.snippet}</div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500 py-2">No reviews found for this hardware.</div>
                      )}
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
