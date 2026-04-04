"use client";
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { addGear, getGearReviews } from "@/app/actions/gearActions";

export default function ExploreClient({ trending }: { trending: any[] }) {
  const { data: session } = useSession();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [reviewGearName, setReviewGearName] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleAdd = async (name: string, category: string, id: string) => {
    if (!session) return alert("Please log in to add gear!");
    setAddingId(id);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    await addGear(formData);
    setAddingId(null);
    alert("Added " + name + " to your setup!");
  };

  const handleReviews = async (name: string) => {
    if (reviewGearName === name) {
      setReviewGearName(null);
      return;
    }
    setReviewGearName(name);
    setLoadingReviews(true);
    const res = await getGearReviews(name);
    setReviews(res);
    setLoadingReviews(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trending.map((item, idx) => {
        const uniqueId = item.name + idx;
        return (
          <div key={uniqueId} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col">
            {/* IMAGE */}
            <div className="w-full h-40 bg-[#111] flex items-center justify-center p-4">
              {item.imageUrl && !item.imageUrl.startsWith("ERROR") ? (
                <Image src={item.imageUrl} alt={item.name} width={400} height={400} className="w-full h-full object-contain" unoptimized />
              ) : (
                <span className="text-zinc-800 text-xs font-bold uppercase tracking-widest">{item.category}</span>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-[#111] text-[9px] font-black text-zinc-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                  {item.category}
                </span>
                <span className="text-[10px] text-green-500 font-bold tracking-widest">
                  {item.count} Users
                </span>
              </div>
              
              <h3 className="text-sm font-black text-white mb-4 leading-tight">{item.name}</h3>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleAdd(item.name, item.category, uniqueId)}
                  disabled={addingId === uniqueId}
                  className="flex-1 bg-green-600 text-black text-[10px] font-black py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50 uppercase tracking-widest"
                >
                  {addingId === uniqueId ? "Adding..." : "Add to Setup"}
                </button>
                <button
                  onClick={() => handleReviews(item.name)}
                  className="px-3 border border-zinc-800 text-zinc-400 text-[10px] font-bold rounded-lg hover:border-blue-500 hover:text-blue-400 transition uppercase tracking-widest"
                >
                  Reviews
                </button>
              </div>
            </div>

            {/* REVIEWS DRAWER */}
            {reviewGearName === item.name && (
              <div className="px-5 pb-5 pt-0 bg-[#0a0a0a]">
                <div className="border-t border-[#1a1a1a] pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Trusted Reviews</span>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="text-[11px] text-zinc-500 animate-pulse font-medium">Searching the web...</div>
                  ) : reviews?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {reviews.map((r: any, i: number) => (
                        <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block group">
                          <div className="text-xs font-bold text-white group-hover:text-blue-400 transition mb-1 line-clamp-1">{r.title}</div>
                          <div className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{r.snippet}</div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-500">No reviews found for this product.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {trending.length === 0 && (
        <div className="col-span-full text-center py-20 text-zinc-600 text-sm">
          No gear found in the database yet.
        </div>
      )}
    </div>
  );
}
