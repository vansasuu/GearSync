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
          if (data.steamId) {
            setSteamId(data.steamId);
            setSavedSteamId(data.steamId);
          }
          if (data.valorantId) {
            setValorantId(data.valorantId);
            setSavedValorantId(data.valorantId);
          }
          if (!data.steamId && !data.valorantId) {
            setEditingAccounts(true);
          }
          // Fetch steam/valorant stats for the clean display
          if (session.user?.name) {
            fetch(`/api/user/stats?username=${encodeURIComponent(session.user.name)}`)
              .then(r => r.json())
              .then(stats => setSteamStats(stats));
          }
        });
    }
  }, [session]);

  const handleLink = async () => {
    setLinking(true);
    await fetch("/api/user/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamId, valorantId }),
    });
    setLinking(false);
    setLinked(true);
    setTimeout(() => setLinked(false), 2000);
  };

  const mainingCount = myGear.filter((g) => g.isMain).length;

  if (!session) {
    return (
      <main className="min-h-screen bg-[#050505] text-white font-sans">
        <nav className="border-b border-[#1a1a1a] px-8 h-14 flex items-center justify-between bg-[#050505]">
          <span className="text-lg font-black tracking-tighter text-green-500">GEARSYNC</span>
          <div className="flex items-center gap-6">
            <a href="/explore" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition">Explore Gear</a>
            <a href="/pros" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition">CS2 Pros</a>
            <button
              onClick={() => signIn("discord")}
              className="bg-[#5865F2] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#4752c4] transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Login with Discord
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-8 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 bg-green-950/40 border border-green-900 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Discord Bot Live</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-5">
            Track your gear.<br />
            <span className="text-green-500">Flex on Discord.</span>
          </h1>

          <p className="text-zinc-500 text-base max-w-md leading-relaxed mb-10">
            Set up your gaming gear profile once. Let anyone in your Discord server check your setup with a simple slash command.
          </p>

          <div className="flex items-center gap-4 flex-wrap mb-20">
            <button
              onClick={() => signIn("discord")}
              className="bg-[#5865F2] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#4752c4] transition flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Login with Discord
            </button>
            <a href="/pros" className="border border-zinc-800 text-zinc-400 text-sm font-semibold px-7 py-3.5 rounded-full hover:border-zinc-600 hover:text-white transition">
              View CS2 Pros →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
            {[
              { category: "Mouse", name: "Razer DeathAdder V3 Pro" },
              { category: "Keyboard", name: "Wooting 60HE" },
              { category: "Headset", name: "HyperX Cloud Alpha" },
            ].map((item) => (
              <div key={item.category} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5">
                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-3">{item.category}</div>
                <div className="text-sm font-bold text-white mb-3">{item.name}</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Maining</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#0f0f0f] pt-10">
            <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-5">Discord Bot Commands</div>
            <div className="flex flex-col gap-3">
              {[
                { cmd: "/whichmouse @sassuan", result: "→ Razer DeathAdder V3 Pro ★ Maining" },
                { cmd: "/whichkeyboard @sassuan", result: "→ Wooting 60HE ★ Maining" },
                { cmd: "/setup @sassuan", result: "→ Full gear profile card" },
              ].map((item) => (
                <div key={item.cmd} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-5 py-3.5 flex items-center gap-4 flex-wrap">
                  <span className="text-green-500 font-bold font-mono text-sm">{item.cmd}</span>
                  <span className="text-zinc-600 text-xs">{item.result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      <nav className="w-full h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#050505] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-black tracking-tighter text-green-500">GEARSYNC</h1>
          <a href="/explore" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition">Explore Gear</a>
          <a href="/pros" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition">CS2 Pros</a>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/u/${session.user?.name}`} className="text-[10px] font-bold text-green-500 uppercase tracking-widest hover:text-green-400 transition">
            My Profile ↗
          </a>
          <button
            onClick={() => signOut()}
            className="text-[10px] border border-zinc-800 px-3 py-1 rounded hover:bg-red-500/10 hover:text-red-500 transition uppercase font-bold text-zinc-500"
          >
            Sign Out
          </button>
          <img src={session.user?.image || ""} className="w-7 h-7 rounded-full border border-zinc-700" alt="profile" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-56px)]">

        <aside className="md:col-span-4 border-r border-[#1a1a1a] p-6 flex flex-col gap-6">

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col items-center gap-4">
            <img src={session.user?.image || ""} alt="avatar" className="w-14 h-14 rounded-full border-2 border-green-500" />
            <div className="text-center">
              <div className="font-black text-white text-base">{session.user?.name}</div>
              <div className="text-[11px] text-zinc-600 mt-0.5">gearsync.gg/u/{session.user?.name}</div>
            </div>
            <div className="w-full bg-[#111] rounded-xl px-4 py-3 flex justify-between items-center">
              <div className="text-center">
                <div className="text-lg font-black text-green-500">{myGear.length}</div>
                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Gear</div>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]"></div>
              <div className="text-center">
                <div className="text-lg font-black text-green-500">{mainingCount}</div>
                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Maining</div>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]"></div>
              <div className="text-center">
                <div className="text-lg font-black text-green-500">{myGear.length - mainingCount}</div>
                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Backup</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Add Gear</div>
            <form
              action={async (formData) => {
                await addGear(formData);
                loadData();
              }}
              className="flex flex-col gap-3"
            >
              <input
                name="name"
                placeholder="Razer DeathAdder V3..."
                className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-xl outline-none focus:border-green-500 transition text-sm text-white placeholder:text-zinc-700"
                required
              />
              <select name="category" className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-xl outline-none focus:border-green-500 text-sm text-zinc-400">
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
                className="bg-green-600 text-black font-black py-3 rounded-xl hover:bg-green-500 transition-all uppercase text-[11px] tracking-widest"
              >
                Add to Collection
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Linked Accounts</div>
              {(savedSteamId || savedValorantId) && !editingAccounts && (
                <button
                  onClick={() => setEditingAccounts(true)}
                  className="text-[10px] text-zinc-700 hover:text-zinc-400 transition font-bold uppercase tracking-widest"
                >✏ Edit</button>
              )}
            </div>

            {/* CONNECTED VIEW */}
            {(savedSteamId || savedValorantId) && !editingAccounts ? (
              <div className="flex flex-col gap-2">
                {/* Steam card */}
                {savedSteamId && (
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
                    <a
                      href={steamStats?.steam?.profileUrl || `https://steamcommunity.com/profiles/${savedSteamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition group"
                    >
                      {/* Steam logo */}
                      <svg viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0" fill="currentColor">
                        <path className="text-zinc-400 group-hover:text-white transition" fill="currentColor" d="M24 4C12.95 4 4 12.95 4 24c0 9.26 6.19 17.1 14.72 19.54L22 29.62A6 6 0 0 1 24 18a6 6 0 0 1 6 6 6 6 0 0 1-4.37 5.78l-3.79 9.14A20.06 20.06 0 0 0 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm-8.5 30.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Steam</div>
                        <div className="text-sm font-bold text-white truncate">
                          {steamStats?.steam?.steamName || "Steam Account"}
                        </div>
                      </div>
                      <span className="text-zinc-700 group-hover:text-zinc-400 transition text-xs ml-1">↗</span>
                    </a>
                    {/* Game Hours Grid */}
                    {steamStats?.steam?.gameHours && (
                      <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border-t border-[#1a1a1a]">
                        {[
                          { key: "cs2", label: "CS2", color: "text-yellow-500" },
                          { key: "pubg", label: "PUBG", color: "text-orange-500" },
                          { key: "r6", label: "R6 Siege", color: "text-blue-400" },
                          { key: "apex", label: "Apex", color: "text-red-500" },
                        ].filter(g => steamStats.steam.gameHours[g.key] > 0).map(g => (
                          <div key={g.key} className="bg-[#0a0a0a] px-4 py-2.5 flex items-center justify-between">
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
                    className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 hover:border-zinc-600 transition group"
                  >
                    <span className="text-base flex-shrink-0">🔫</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Valorant</div>
                      <div className="text-sm font-bold text-white truncate">{savedValorantId}</div>
                    </div>
                    {steamStats?.valorant?.rank && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-green-500">{steamStats.valorant.rank}</div>
                        <div className="text-[9px] text-zinc-600">{steamStats.valorant.rr} RR</div>
                      </div>
                    )}
                    <span className="text-zinc-700 group-hover:text-zinc-400 transition text-xs ml-1">↗</span>
                  </a>
                )}
              </div>
            ) : (
              /* EDIT / SETUP VIEW */
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-700 uppercase">Steam ID</label>
                  <input
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    placeholder="76561198XXXXXXXXX"
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-xl outline-none focus:border-green-500 transition text-sm text-white placeholder:text-zinc-700"
                  />
                  <p className="text-[10px] text-zinc-700">Find at steamid.io</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-700 uppercase">Valorant ID</label>
                  <input
                    value={valorantId}
                    onChange={(e) => setValorantId(e.target.value)}
                    placeholder="name#tag"
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-xl outline-none focus:border-green-500 transition text-sm text-white placeholder:text-zinc-700"
                  />
                </div>
                <button
                  onClick={async () => {
                    await handleLink();
                    setSavedSteamId(steamId);
                    setSavedValorantId(valorantId);
                    setEditingAccounts(false);
                    // refresh stats after saving
                    if (session?.user?.name) {
                      fetch(`/api/user/stats?username=${encodeURIComponent(session.user.name)}`)
                        .then(r => r.json()).then(s => setSteamStats(s));
                    }
                  }}
                  disabled={linking}
                  className="border border-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl hover:border-green-500 hover:text-green-500 transition-all uppercase text-[11px] tracking-widest"
                >
                  {linked ? "✓ Saved!" : linking ? "Saving..." : "Save Accounts"}
                </button>
                {editingAccounts && (
                  <button onClick={() => setEditingAccounts(false)} className="text-[10px] text-zinc-700 hover:text-zinc-400 transition uppercase tracking-widest">
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="md:col-span-8 p-6">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-5">
            My Setup ({myGear.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myGear.map((item) => (
              <div
                key={item._id}
                className={`border rounded-2xl overflow-hidden transition-all group relative ${
                  item.isMain
                    ? "bg-[#0a0a0a] border-green-800"
                    : "bg-[#0a0a0a] border-[#1a1a1a] hover:border-zinc-700"
                }`}
              >
                {/* IMAGE */}
                <div className="relative">
                  {item.imageUrl ? (
                    item.imageUrl.startsWith("ERROR_") ? (
                      <div className="w-full h-36 bg-red-950 flex p-4 items-center justify-center text-[10px] text-red-500 font-bold text-center break-words">
                        {item.imageUrl}
                      </div>
                    ) : (
                      <div className="w-full h-36 bg-[#111] flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.display = "none";
                          }}
                        />
                      </div>
                    )
                  ) : (
                    <div className="w-full h-36 bg-[#0d0d0d] flex items-center justify-center">
                      <span className="text-zinc-800 text-xs font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  )}
                  {/* Camera icon overlay */}
                  <button
                    onClick={() => {
                      setEditingImageId(item._id);
                      setEditImageUrl(item.imageUrl || "");
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded-lg transition hover:bg-green-900/80 hover:text-green-400"
                    title="Change image URL"
                  >
                    📷
                  </button>
                </div>

                {/* Inline image URL editor */}
                {editingImageId === item._id && (
                  <div className="px-4 pt-3 pb-1 flex gap-2 border-t border-[#1a1a1a]">
                    <input
                      autoFocus
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 bg-[#111] border border-[#222] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-green-500 transition placeholder:text-zinc-700"
                    />
                    <button
                      onClick={async () => {
                        await updateGearImage(item._id, editImageUrl);
                        setEditingImageId(null);
                        setEditImageUrl("");
                        loadData();
                      }}
                      className="bg-green-600 text-black text-xs font-black px-3 py-2 rounded-lg hover:bg-green-500 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingImageId(null); setEditImageUrl(""); }}
                      className="text-zinc-600 text-xs px-2 py-2 hover:text-white transition"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                      item.isMain
                        ? "bg-green-950 text-green-500 border border-green-900"
                        : "bg-[#111] text-zinc-600"
                    }`}>
                      {item.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isMain ? "bg-green-500" : "bg-zinc-700"}`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${item.isMain ? "text-green-500" : "text-zinc-600"}`}>
                          {item.isMain ? "Maining" : "Backup"}
                        </span>
                      </div>
                      <button
                        onClick={() => { deleteGear(item._id); loadData(); }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 text-[10px] font-bold transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-white mb-1 leading-tight">{item.name}</h3>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={async () => { await toggleMain(item._id, item.category); loadData(); }}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition uppercase tracking-wider ${
                        item.isMain
                          ? "border-green-800 text-green-500 bg-green-950/50"
                          : "border-zinc-800 text-zinc-600 hover:border-green-700 hover:text-green-500"
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
                      className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:border-zinc-500 hover:text-white transition uppercase tracking-wider"
                    >
                      Reviews
                    </button>
                  </div>
                </div>

                {/* REVIEWS DRAWER */}
                {reviewGearId === item._id && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-[#1a1a1a] pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Trusted Reviews</span>
                      </div>
                      
                      {loadingReviews ? (
                        <div className="text-[11px] text-zinc-500 animate-pulse font-medium">Searching the web...</div>
                      ) : reviews?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {reviews.map((r: any, i: number) => (
                            <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block group">
                              <div className="text-xs font-bold text-white group-hover:text-blue-400 transition mb-1 line-clamp-1">{r.title}</div>
                              <div className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{r.snippet}</div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500">No reviews found for this product.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {myGear.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-[#1a1a1a] rounded-2xl py-20 text-center text-zinc-700 text-sm font-medium">
                No hardware detected. Add your first piece of gear.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
