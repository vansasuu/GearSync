import connectToDatabase from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Gear from "@/models/Gear";

async function connectDB() {
  await connectToDatabase();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get("discordId");
  const category = searchParams.get("category");

  if (!discordId) {
    return NextResponse.json({ error: "discordId required" }, { status: 400 });
  }

  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const query: any = { discordId };
  if (category) query.category = category;

  const gear = await Gear.find(query).sort({ isMain: -1, createdAt: -1 });
  return NextResponse.json(JSON.parse(JSON.stringify(gear)));
}