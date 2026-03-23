import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

async function getSteamStats(steamId: string) {
  try {
    // Get CS2 hours
    const hoursRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json`
    );
    const hoursData = await hoursRes.json();
    const cs2 = hoursData.response?.games?.find((g: any) => g.appid === 730);
    const hours = cs2 ? Math.round(cs2.playtime_forever / 60) : 0;

    // Get Steam profile
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}&format=json`
    );
    const profileData = await profileRes.json();
    const profile = profileData.response?.players?.[0];

    return {
      hours,
      steamName: profile?.personaname,
      avatar: profile?.avatarmedium,
      profileUrl: profile?.profileurl,
    };
  } catch (error) {
    return null;
  }
}

async function getValorantStats(valorantId: string) {
  try {
    const [name, tag] = valorantId.split('#');
    if (!name || !tag) return null;

    const res = await fetch(
      `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );
    const data = await res.json();

    if (data.status !== 200) return null;

    return {
      rank: data.data?.current_data?.currenttierpatched,
      rr: data.data?.current_data?.ranking_in_tier,
      peak: data.data?.highest_rank?.patched_tier,
    };
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const discordUsername = searchParams.get('username');

  if (!discordUsername) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({
    discordUsername: { $regex: new RegExp(`^${discordUsername}$`, 'i') }
  });

  if (!user) return NextResponse.json({});

  const [steam, valorant] = await Promise.all([
    user.steamId ? getSteamStats(user.steamId) : null,
    user.valorantId ? getValorantStats(user.valorantId) : null,
  ]);

  return NextResponse.json({ steam, valorant });
}