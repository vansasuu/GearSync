import mongoose from "mongoose";
import Gear from "@/models/Gear";
import ExploreClient from "./ExploreClient";

export const revalidate = 60; // Revalidate every minute

async function getTrendingGear() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  try {
    const trending = await Gear.aggregate([
      {
        $group: {
          _id: { name: "$name", category: "$category", imageUrl: "$imageUrl" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 60 }
    ]);

    return JSON.parse(JSON.stringify(trending.map((t: any) => ({
      name: t._id.name,
      category: t._id.category,
      imageUrl: t._id.imageUrl,
      count: t.count
    }))));
  } catch (e) {
    console.error("Explore fetch error:", e);
    return [];
  }
}

export default async function ExplorePage() {
  const trending = await getTrendingGear();

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      {/* NAV */}
      <nav className="w-full h-14 border-b border-[#1a1a1a] flex items-center justify-between px-8 bg-[#050505] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-black tracking-tighter text-green-500">GEARSYNC</a>
          <a href="/pros" className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition">CS2 Pros</a>
        </div>
        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Explore Gear</span>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-1">Gear Directory</h1>
            <p className="text-sm text-zinc-600">Discover and use the most popular gear in the community.</p>
          </div>
          <a
            href="/"
            className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-4 py-2 rounded-lg hover:border-zinc-600 hover:text-white transition"
          >
            ← Back to Setup
          </a>
        </div>

        {/* CLIENT COMPONENT FOR INTERACTIVITY */}
        <ExploreClient trending={trending} />
        
      </div>
    </main>
  );
}
