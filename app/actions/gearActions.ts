import connectToDatabase from "@/lib/mongoose";
"use server";
import Gear from "@/models/Gear";
import GearHistory from "@/models/GearHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

async function connectDB() {
  await connectToDatabase();
}

// 1. ADD GEAR
export async function addGear(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Not authenticated");

  await connectDB();

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const isWishlist = formData.get("isWishlist") === "true";

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
      isWishlist,
      imageUrl,
    });

    await GearHistory.create({
      userId: session.user.email,
      action: isWishlist ? 'wishlist_added' : 'added',
      gearName: name,
      category,
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
    const item = await Gear.findOne({ _id: id, userId: session.user.email });
    if (item) {
      await GearHistory.create({
        userId: session.user.email,
        action: 'removed',
        gearName: item.name,
        category: item.category,
      });
    }
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
    const item = await Gear.findByIdAndUpdate(id, { isMain: true }, { new: true });

    if (item) {
      await GearHistory.create({
        userId: session.user.email,
        action: 'set_main',
        gearName: item.name,
        category: item.category,
      });
    }

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

// 7. GET GEAR REVIEWS (from Serper.dev)
export async function getGearReviews(productName: string) {
  if (!process.env.SERPER_API_KEY) return [];

  const query = `${productName} review`;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query, num: 3 })
    });

    const data = await res.json();
    return data.organic || [];
  } catch (e) {
    console.error("REVIEW FETCH ERROR:", e);
    return [];
  }
}

// 8. CHECK PRICE (Serper shopping search, saves to DB)
export async function getGearPrice(id: string, productName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  if (!process.env.SERPER_API_KEY) return { price: null, priceUrl: null };

  await connectDB();

  try {
    const res = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: productName })
    });
    const data = await res.json();

    if (data.shopping && data.shopping.length > 0) {
      const first = data.shopping[0];
      const price = first.price as string;
      const priceUrl = first.link as string;

      await Gear.findOneAndUpdate(
        { _id: id, userId: session.user.email },
        { price, priceUrl }
      );

      return { price, priceUrl };
    }
  } catch (e) {
    console.error("PRICE FETCH ERROR:", e);
  }

  return { price: null, priceUrl: null };
}

// 9. GET GEAR HISTORY
export async function getGearHistory() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  await connectDB();

  try {
    const history = await GearHistory.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(30);
    return JSON.parse(JSON.stringify(history));
  } catch (error) {
    console.error("HISTORY FETCH ERROR:", error);
    return [];
  }
}

// 10. IMPORT PRO SETUP TO WISHLIST
export async function importProSetup(proId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Not authenticated");

  await connectDB();

  const Pro = (await import('@/models/Pro')).default;
  const pro = await Pro.findById(proId);
  if (!pro) throw new Error("Pro not found");

  const gearMap = [
    { field: 'mouse', category: 'Mouse' },
    { field: 'keyboard', category: 'Keyboard' },
    { field: 'headset', category: 'Headset' },
    { field: 'mousepad', category: 'Mousepad' },
    { field: 'monitor', category: 'Monitor' },
  ];

  const itemsToCreate = gearMap
    .filter(({ field }) => pro.gear?.[field])
    .map(({ field, category }) => ({
      userId: session.user!.email,
      discordId: (session as any).discordId ?? null,
      discordUsername: session.user!.name ?? null,
      name: pro.gear[field],
      category,
      isMain: false,
      isWishlist: true,
      imageUrl: null,
    }));

  if (itemsToCreate.length === 0) return { success: true, count: 0 };

  await Gear.insertMany(itemsToCreate);

  await GearHistory.create({
    userId: session.user.email,
    action: 'wishlist_imported',
    gearName: `${pro.name}'s Setup`,
    category: 'Import',
    detail: `${itemsToCreate.length} items · ${pro.team || pro.game}`,
  });

  return { success: true, count: itemsToCreate.length };
}
