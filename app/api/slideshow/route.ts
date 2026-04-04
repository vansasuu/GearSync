import connectToDatabase from "@/lib/mongoose";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Gear from "@/models/Gear";

export const revalidate = 120;

export async function GET() {
  try {
    await connectToDatabase();

    const trending = await Gear.aggregate([
      {
        $group: {
          _id: { name: "$name", category: "$category", imageUrl: "$imageUrl" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);

    // Pick one per category for variety, up to 8 slides
    const seen = new Set<string>();
    const slides: { name: string; category: string; imageUrl: string; count: number }[] = [];
    for (const t of trending) {
      if (!seen.has(t._id.category)) {
        seen.add(t._id.category);
        slides.push({
          name: t._id.name,
          category: t._id.category,
          imageUrl: t._id.imageUrl ?? "",
          count: t.count,
        });
      }
      if (slides.length >= 8) break;
    }

    return NextResponse.json(slides);
  } catch (e) {
    console.error("Slideshow API error:", e);
    return NextResponse.json([]);
  }
}
