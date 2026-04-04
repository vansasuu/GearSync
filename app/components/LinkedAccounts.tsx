"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LinkedAccounts() {
  const { data: session } = useSession();
  const [steamId, setSteamId] = useState("");
  const [valorantId, setValorantId] = useState("");
  const [savedSteamId, setSavedSteamId] = useState("");
  const [savedValorantId, setSavedValorantId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [steamStats, setSteamStats] = useState<any>(null);
  const [editingAccounts, setEditingAccounts] = useState(false);

  useEffect(() => {
    if (session) {
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

  return (
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
  );
}
