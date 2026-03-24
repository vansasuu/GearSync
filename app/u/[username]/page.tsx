import mongoose from "mongoose";
import Gear from "@/models/Gear";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const ogImage = `${baseUrl}/api/og/${encodeURIComponent(username)}`;

  return {
    title: `${username}'s Gear — GearSync`,
    description: `Check out ${username}'s gaming gear setup on GearSync.`,
    openGraph: {
      title: `${username}'s Gear — GearSync`,
      description: `Check out ${username}'s gaming gear setup on GearSync.`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      url: `${baseUrl}/u/${username}`,
      siteName: "GearSync",
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Gear — GearSync`,
      description: `Check out ${username}'s gaming gear setup on GearSync.`,
      images: [ogImage],
    },
  };
}

async function getUserGear(username: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  const gear = await Gear.find({
    discordUsername: { $regex: new RegExp(`^${username}$`, "i") },
    isMain: true,
  }).sort({ createdAt: -1 });

  if (gear.length === 0) return null;
  return JSON.parse(JSON.stringify(gear));
}

async function getUserInfo(username: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  const anyGear = await Gear.findOne({
    discordUsername: { $regex: new RegExp(`^${username}$`, "i") },
  });
  if (!anyGear) return null;
  return {
    discordUsername: anyGear.discordUsername,
    discordId: anyGear.discordId,
  };
}

async function getUserStats(username: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user/stats?username=${username}`, {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return {};
  }
}

async function checkIfPro(username: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  const ProModel =
    mongoose.models.Pro ||
    mongoose.model("Pro", new mongoose.Schema({ name: String }));
  const pro = await ProModel.findOne({
    name: { $regex: new RegExp(`^${username}$`, "i") },
  });
  return !!pro;
}

const categoryEmojis: Record<string, string> = {
  Mouse: "🖱️",
  Keyboard: "⌨️",
  Headset: "🎧",
  Mousepad: "🟫",
  Monitor: "🖥️",
  Audio: "🔊",
  Controller: "🎮",
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);
  const gear = await getUserGear(username);
  const userInfo = await getUserInfo(username);

  if (!userInfo) return notFound();

  const [statsData, isPro] = await Promise.all([
    getUserStats(username),
    checkIfPro(username),
  ]);

  const stats = { ...statsData, isPro };

  const avatarUrl = userInfo.discordId
    ? `https://cdn.discordapp.com/embed/avatars/${parseInt(userInfo.discordId) % 5}.png`
    : null;

  return (
    <main className="min-h-screen bg-[#000] text-white font-sans selection:bg-green-500/30">
      {/* GLOW BACKGROUND EFFECT */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center mt-[-10%]">
        <div className="w-[800px] h-[500px] bg-green-900/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="relative z-10 w-full h-16 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 bg-black/50 backdrop-blur-xl">
        <a href="/" className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <span className="text-green-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </span>
          GEARSYNC
        </a>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        
        {/* MAIN PROFILE CARD */}
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
          
          {/* BANNER */}
          <div className="h-32 sm:h-48 w-full bg-gradient-to-br from-green-500/20 via-zinc-900 to-[#0a0a0a] relative border-b border-white/5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>

          {/* HEADER SECTION */}
          <div className="px-6 sm:px-10 pb-8 sm:pb-10 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* AVATAR */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-[#0a0a0a] bg-zinc-900 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-[#0a0a0a] bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-4xl sm:text-5xl font-black text-green-500 shadow-2xl">
                    {username.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* USER INFO */}
                <div className="pb-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-2">{username}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">Global Profile</span>
                    {stats.isPro && (
                      <span className="text-xs font-black bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Pro Player
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SOCIAL LINKS (Right on desktop) */}
              <div className="flex items-center gap-3 sm:pb-2">
                <a
                  href={`https://discord.com/users/${userInfo.discordId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                  title="Discord Profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                </a>
                {stats.isPro && (
                  <a
                    href={`https://prosettings.net/players/${username.toLowerCase()}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    ProSettings ↗
                  </a>
                )}
              </div>
            </div>

            {/* SEPARATOR */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8 sm:my-12"></div>

            {/* TWO COLUMN CONTENT LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
              
              {/* LEFT COLUMN: STATS (1/3 width on desktop) */}
              {(stats.steam || stats.valorant) && (
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Game Stats</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {stats.steam && (
                      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] rounded-2xl p-5 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-black/50 flex items-center justify-center border border-white/5 text-xl">🎮</div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CS2</div>
                            <div className="text-[10px] text-zinc-600">Steam</div>
                          </div>
                        </div>
                        <div className="font-bold text-white text-lg truncate mb-1">{stats.steam.steamName}</div>
                        <div className="flex items-baseline gap-1.5 mt-3">
                          <span className="text-3xl font-black text-white tracking-tighter">{stats.steam.hours.toLocaleString()}</span>
                          <span className="text-sm font-bold text-zinc-500">hours</span>
                        </div>
                      </div>
                    )}

                    {stats.valorant && (
                      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] rounded-2xl p-5 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-xl text-red-500">🔫</div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-red-400 uppercase tracking-widest">{stats.valorant.rr} RR</div>
                            <div className="text-[10px] text-zinc-500">Peak: {stats.valorant.peak}</div>
                          </div>
                        </div>
                        <div className="font-bold text-white text-lg truncate mb-1">Valorant</div>
                        <div className="flex items-baseline gap-1.5 mt-3">
                          <span className="text-2xl font-black text-white tracking-tighter">{stats.valorant.rank}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN: GEAR (2/3 width on desktop) */}
              <div className="w-full flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <h2 className="text-xs font-bold text-green-500 uppercase tracking-[0.2em]">Current Setup</h2>
                </div>

                {gear && gear.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gear.map((item: any) => (
                      <div
                        key={item._id}
                        className="group bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.02] hover:border-green-500/30 transition-all flex flex-col h-full relative overflow-hidden"
                      >
                        {item.isMain && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent blur-xl pointer-events-none"></div>
                        )}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-lg bg-black/50 w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center shadow-inner">
                              {categoryEmojis[item.category] || "🎮"}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.category}</span>
                          </div>
                          {item.isMain && (
                            <span className="text-[9px] font-black tracking-widest uppercase bg-green-500 text-black px-2 py-0.5 rounded-sm shadow-sm ring-1 ring-green-500/50">
                              Main
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 mt-1">
                          <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors leading-snug">
                            {item.name}
                          </h3>
                        </div>
                        
                        {item.imageUrl && (
                          <div className="mt-4 w-full h-24 rounded-xl bg-black/40 overflow-hidden border border-white/5 relative group-hover:border-white/10 transition-colors">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-white/10 bg-white/[0.01] rounded-2xl py-20 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center text-zinc-600 text-2xl">
                      🖥️
                    </div>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center">No gear added yet.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* BOTTOM BADGE */}
        <div className="mt-8 flex justify-center">
          <div className="px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
            GearSync Profile
          </div>
        </div>
      </div>
    </main>
  );
}
