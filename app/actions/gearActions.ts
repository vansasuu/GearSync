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

  // Auto fetch image via Serper.dev API
  let imageUrl = null;
  const query = `${name} ${category} product`;

  try {
    if (process.env.SERPER_API_KEY) {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: query })
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].imageUrl;
      } else {
        imageUrl = `ERROR_NO_IMAGES_RETURNED_FROM_SERPER`;
      }
    } else {
      imageUrl = `ERROR_MISSING_SERPER_KEY_ON_VERCEL`;
    }
  } catch (e: any) {
    imageUrl = `ERROR_FETCH_CRASHED: ${e.message}`;
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