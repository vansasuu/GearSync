"use server";
import Gear from "@/models/Gear";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

// 1. ADD GEAR
export async function addGear(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Not authenticated");

  await connectDB();

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  // Auto fetch image via multi-stage scraper (DuckDuckGo -> Yahoo fallback)
  let imageUrl = null;
  const query = encodeURIComponent(`${name} ${category} product`);

  try {
    const initRes = await fetch(`https://duckduckgo.com/?q=${query}&iax=images&ia=images`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
    });
    const initHtml = await initRes.text();
    const vqdMatch = initHtml.match(/vqd=([\d-]+)/);
    
    if (vqdMatch) {
      const vqd = vqdMatch[1];
      const imgRes = await fetch(
        `https://duckduckgo.com/i.js?q=${query}&vqd=${vqd}&f=,,,,,&p=1`,
        { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36", "Referer": "https://duckduckgo.com/" } }
      );
      const imgData = await imgRes.json();
      imageUrl = imgData.results?.[0]?.image ?? null;
    }
  } catch (e) {
    console.error("DDG Fetch failed:", e);
  }

  // Fallback to Bing Images (Vercel-friendly)
  if (!imageUrl) {
    try {
      const bingRes = await fetch(`https://www.bing.com/images/search?q=${query}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" }
      });
      const bingHtml = await bingRes.text();
      const bingMatch = bingHtml.match(/murl&quot;:&quot;(https:\/\/[^&]+)&quot;/i);
      if (bingMatch) imageUrl = bingMatch[1];
    } catch (e) {
      console.error("Bing Fetch failed:", e);
    }
  }

  try {
    await Gear.create({
      userId: session.user.email,
      discordId: (session as any).discordId ?? null,
      discordUsername: session.user.name ?? null,
      name,
      category,
      isMain: false,
      imageUrl,
    });
    return { success: true };
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return { success: false };
  }
}

// 2. GET ALL GEAR (for logged in user)
export async function getGear() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  await connectDB();

  try {
    const gear = await Gear.find({ userId: session.user.email }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(gear));
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return [];
  }
}

// 3. DELETE GEAR
export async function deleteGear(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  await connectDB();

  try {
    await Gear.deleteOne({ _id: id, userId: session.user.email });
    return { success: true };
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return { success: false };
  }
}

// 4. TOGGLE MAIN GEAR
export async function toggleMain(id: string, category: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  await connectDB();

  try {
    await Gear.updateMany(
      { userId: session.user.email, category },
      { isMain: false }
    );
    await Gear.findByIdAndUpdate(id, { isMain: true });
    return { success: true };
  } catch (error) {
    console.error("TOGGLE ERROR:", error);
    return { success: false };
  }
}

// 5. GET GEAR BY DISCORD ID (for the bot)
export async function getGearByDiscordId(discordId: string) {
  await connectDB();
  try {
    const gear = await Gear.find({ discordId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(gear));
  } catch (error) {
    console.error("FETCH BY DISCORD ID ERROR:", error);
    return [];
  }
}

// 6. UPDATE GEAR IMAGE URL
export async function updateGearImage(id: string, imageUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  await connectDB();

  try {
    await Gear.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { imageUrl }
    );
    return { success: true };
  } catch (error) {
    console.error("UPDATE IMAGE ERROR:", error);
    return { success: false };
  }
}