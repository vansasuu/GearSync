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
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      <nav className="w-full h-14 border-b border-[#1a1a1a] flex items-center justify-between px-8 bg-[#050505]">
        <a href="/" className="text-lg font-black tracking-tighter text-green-500">
          GEARSYNC
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">

        {/* PROFILE HEADER */}
        <div className="flex items-center gap-5 mb-12">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-16 h-16 rounded-full border-2 border-zinc-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-xl font-black text-green-500">
              {username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tighter">{username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-zinc-600">GearSync Profile</p>
              {stats.isPro && (
                <span className="text-[9px] font-black bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-tighter">
                  Pro Player
                </span>
              )}
            </div>
          </div>
        </div>

        {/* GAME STATS */}
        {(stats.steam || stats.valorant) && (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4">
              Game Stats
            </h2>
            <div className="flex flex-col gap-3">
              {stats.steam && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">🎮</span>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">
                        Steam · CS2
                      </div>
                      <div className="text-sm font-bold text-white">
                        {stats.steam.steamName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-green-500">
                      {stats.steam.hours.toLocaleString()}h
                    </div>
                    <div className="text-[10px] text-zinc-600">in CS2</div>
                  </div>
                </div>
              )}
              {stats.valorant && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">🔫</span>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">
                        Valorant
                      </div>
                      <div className="text-sm font-bold text-white">
                        {stats.valorant.rank}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-green-500">
                      {stats.valorant.rr} RR
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      Peak: {stats.valorant.peak}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GEAR */}
        {gear && gear.length > 0 ? (
          <>
            <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4">
              Current Setup
            </h2>
            <div className="flex flex-col gap-3">
              {gear.map((item: any) => (
                <div
                  key={item._id}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">
                      {categoryEmojis[item.category] || "🎮"}
                    </span>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">
                        {item.category}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                      Maining
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl py-16 text-center text-zinc-600 text-sm">
            No gear set up yet.
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-[#111] flex items-center justify-between">
          <a
            href={`https://discord.com/users/${userInfo.discordId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-zinc-600 hover:text-white transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Discord Profile
          </a>
          {stats.isPro && (
            <a
              href={`https://prosettings.net/players/${username.toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-zinc-600 hover:text-green-500 transition"
            >
              ProSettings.net ↗
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
