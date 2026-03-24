"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { addGear, getGear, deleteGear, toggleMain, updateGearImage, getGearReviews } from "@/app/actions/gearActions";
import { useEffect, useState } from "react";

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

  const loadData = async () => {
    const data = await getGear();
    setMyGear(data);
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

  const mainingCount = myGear.filter((g) => g.isMain).length;
  const categories = ["All", ...Array.from(new Set(myGear.map(g => g.category)))];
  const filteredGear = filterCategory === "All" ? myGear : myGear.filter(g => g.category === filterCategory);

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

        {/* ═══ GEAR PREVIEW CARDS ═══ */}
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { category: "Mouse", name: "Razer DeathAdder V3 Pro", emoji: "🖱️" },
              { category: "Keyboard", name: "Wooting 60HE", emoji: "⌨️" },
              { category: "Headset", name: "HyperX Cloud Alpha", emoji: "🎧" },
            ].map((item, i) => (
              <div
                key={item.category}
                className={`gear-card gradient-border bg-[#0a0a0a] rounded-2xl p-6 animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="text-3xl mb-4">{item.emoji}</div>
                <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">{item.category}</div>
                <div className="text-base font-bold text-white mb-4">{item.name}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Maining</span>
                </div>
              </div>
            ))}
          </div>
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
          <div className="gradient-border bg-[#0a0a0a] rounded-2xl p-6 flex flex-col items-center gap-5 animate-fade-in-up">
            <img src={session.user?.image || ""} alt="avatar" className="w-16 h-16 rounded-2xl border-2 border-green-500 shadow-lg shadow-green-500/10" />
            <div className="text-center">
              <div className="font-black text-white text-lg">{session.user?.name}</div>
              <div className="text-xs text-zinc-500 mt-1">gearsync.gg/u/{session.user?.name}</div>
            </div>
            <div className="w-full bg-[#111] rounded-xl px-5 py-4 flex justify-between items-center">
              <div className="text-center">
                <div className="text-xl font-black text-green-500">{myGear.length}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gear</div>
              </div>
              <div className="w-px h-10 bg-[#1a1a1a]"></div>
              <div className="text-center">
                <div className="text-xl font-black text-green-500">{mainingCount}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Maining</div>
              </div>
              <div className="w-px h-10 bg-[#1a1a1a]"></div>
              <div className="text-center">
                <div className="text-xl font-black text-green-500">{myGear.length - mainingCount}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Backup</div>
              </div>
            </div>
          </div>

          {/* Add Gear */}
          <div className="animate-fade-in-up stagger-1">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Add Gear</div>
            <form
              action={async (formData) => { await addGear(formData); loadData(); }}
              className="flex flex-col gap-3"
            >
              <input
                name="name"
                placeholder="Razer DeathAdder V3..."
                className="bg-[#0a0a0a] border border-[#1a1a1a] p-3.5 rounded-xl outline-none focus:border-green-500 focus:shadow-lg focus:shadow-green-500/5 transition-all text-sm text-white placeholder:text-zinc-700"
                required
              />
              <select name="category" className="bg-[#0a0a0a] border border-[#1a1a1a] p-3.5 rounded-xl outline-none focus:border-green-500 text-sm text-zinc-400">
                <option value="Mouse">Mouse</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Headset">Headset</option>
                <option value="Mousepad">Mousepad</option>
                <option value="Monitor">Monitor</option>
                <option value="Audio">Audio</option>
                <option value="Controller">Controller</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-black font-black py-3.5 rounded-xl hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all uppercase text-xs tracking-widest"
              >
                Add to Collection
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
          <div className="flex items-center justify-between mb-6 animate-fade-in-up">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">My Setup ({myGear.length})</div>
          </div>

          {/* ═══ CATEGORY FILTER PILLS ═══ */}
          {myGear.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up stagger-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    filterCategory === cat
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                      : "bg-[#111] text-zinc-500 border border-[#1a1a1a] hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ═══ GEAR CARDS ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredGear.map((item, i) => (
              <div
                key={item._id}
                className={`gear-card border rounded-2xl overflow-hidden group relative animate-fade-in-up stagger-${(i % 6) + 1} ${
                  item.isMain
                    ? "bg-[#0a0a0a] border-green-800/50"
                    : "bg-[#0a0a0a] border-[#1a1a1a]"
                }`}
              >
                {/* IMAGE */}
                <div className="relative">
                  {item.imageUrl ? (
                    item.imageUrl.startsWith("ERROR_") ? (
                      <div className="w-full h-40 bg-red-950/30 flex p-4 items-center justify-center text-xs text-red-400 font-bold text-center break-words">{item.imageUrl}</div>
                    ) : (
                      <div className="w-full h-40 bg-[#111] flex items-center justify-center overflow-hidden">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                      </div>
                    )
                  ) : (
                    <div className="w-full h-40 bg-[#0d0d0d] flex items-center justify-center">
                      <span className="text-zinc-700 text-sm font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  )}
                  <button
                    onClick={() => { setEditingImageId(item._id); setEditImageUrl(item.imageUrl || ""); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-green-600 hover:text-black font-bold"
                    title="Change image URL"
                  >📷</button>
                </div>

                {/* Inline image URL editor */}
                {editingImageId === item._id && (
                  <div className="px-4 pt-3 pb-1 flex gap-2 border-t border-[#1a1a1a] animate-fade-in">
                    <input autoFocus value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Paste image URL..."
                      className="flex-1 bg-[#111] border border-[#222] text-xs text-white px-3 py-2.5 rounded-lg outline-none focus:border-green-500 transition placeholder:text-zinc-700" />
                    <button
                      onClick={async () => { await updateGearImage(item._id, editImageUrl); setEditingImageId(null); setEditImageUrl(""); loadData(); }}
                      className="bg-green-600 text-black text-xs font-black px-4 py-2.5 rounded-lg hover:bg-green-500 transition"
                    >Save</button>
                    <button onClick={() => { setEditingImageId(null); setEditImageUrl(""); }}
                      className="text-zinc-500 text-sm px-2 py-2 hover:text-white transition">✕</button>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${
                      item.isMain
                        ? "bg-green-950 text-green-500 border border-green-900"
                        : "bg-[#111] text-zinc-500"
                    }`}>
                      {item.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${item.isMain ? "bg-green-500 animate-pulse" : "bg-zinc-700"}`}></div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${item.isMain ? "text-green-500" : "text-zinc-600"}`}>
                          {item.isMain ? "Maining" : "Backup"}
                        </span>
                      </div>
                      <button
                        onClick={() => { deleteGear(item._id); loadData(); }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-xs font-bold transition-all"
                      >DELETE</button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mb-1 leading-tight">{item.name}</h3>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={async () => { await toggleMain(item._id, item.category); loadData(); }}
                      className={`text-xs font-black px-4 py-2 rounded-xl border transition-all ${
                        item.isMain
                          ? "border-green-800 text-green-500 bg-green-950/50"
                          : "border-zinc-800 text-zinc-500 hover:border-green-700 hover:text-green-500"
                      }`}
                    >
                      {item.isMain ? "★ Main" : "Set Main"}
                    </button>
                    <button
                      onClick={async () => {
                        if (reviewGearId === item._id) { setReviewGearId(null); return; }
                        setReviewGearId(item._id);
                        setLoadingReviews(true);
                        const res = await getGearReviews(item.name);
                        setReviews(res);
                        setLoadingReviews(false);
                      }}
                      className="text-xs font-bold px-4 py-2 rounded-xl border border-zinc-800 text-zinc-500 hover:border-blue-500 hover:text-blue-400 transition-all"
                    >Reviews</button>
                  </div>
                </div>

                {/* REVIEWS DRAWER */}
                {reviewGearId === item._id && (
                  <div className="px-5 pb-5 pt-0 animate-fade-in">
                    <div className="border-t border-[#1a1a1a] pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Trusted Reviews</span>
                      </div>
                      {loadingReviews ? (
                        <div className="text-sm text-zinc-500 animate-pulse font-medium">Searching the web...</div>
                      ) : reviews?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {reviews.map((r: any, i: number) => (
                            <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block group/review">
                              <div className="text-sm font-bold text-white group-hover/review:text-blue-400 transition mb-1 line-clamp-1">{r.title}</div>
                              <div className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{r.snippet}</div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-500">No reviews found for this product.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {myGear.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-[#1a1a1a] rounded-2xl py-24 text-center text-zinc-600 text-sm font-medium animate-fade-in-up">
                No hardware detected. Add your first piece of gear.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
