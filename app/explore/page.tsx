import connectToDatabase from "@/lib/mongoose";
import mongoose from "mongoose";
import Gear from "@/models/Gear";
import ExploreClient from "./ExploreClient";

export const revalidate = 60; // Revalidate every minute

async function getTrendingGear() {
  await connectToDatabase();

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
      <nav className="glass w-full h-16 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-black tracking-tighter text-green-500">GEARSYNC</a>
          <a href="/pros" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">CS2 Pros</a>
        </div>
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Explore Gear</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Gear Directory</h1>
            <p className="text-base text-zinc-500">Discover and use the most popular gear in the community.</p>
          </div>
          <a
            href="/"
            className="text-sm font-semibold text-zinc-400 border border-zinc-700 px-5 py-2.5 rounded-xl hover:border-green-500 hover:text-white transition-all"
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
