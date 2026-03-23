import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import User from "@/models/User";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { steamId, valorantId } = await req.json();

  // email is always reliably set by NextAuth — use it as the stable primary key
  const email = session.user?.email;
  const discordId = (session as any).discordId;

  if (!email && !discordId) {
    return NextResponse.json({ error: "No identifier available" }, { status: 400 });
  }

  await connectDB();

  try {
    // Build query: prefer email, fall back to discordId
    const query = email ? { email } : { discordId };
    const updatePayload = {
      ...(email && { email }),
      ...(discordId && { discordId }),
      discordUsername: session.user?.name,
      ...(steamId && { steamId }),
      ...(valorantId && { valorantId }),
    };

    console.log('[LINK DEBUG] Query:', query);
    console.log('[LINK DEBUG] Payload:', updatePayload);

    const result = await User.findOneAndUpdate(
      query,
      updatePayload,
      { upsert: true, new: true, runValidators: false }
    );
    
    console.log('[LINK DEBUG] Mongoose Result:', result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("LINK SAVE ERROR:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const email = session.user?.email;
  const discordId = (session as any).discordId;

  // Try email first (most reliable), fall back to discordId
  let user = null;
  if (email) user = await User.findOne({ email });
  if (!user && discordId) user = await User.findOne({ discordId });

  return NextResponse.json(user || {});
}