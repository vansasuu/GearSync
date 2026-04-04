import { useState } from "react";
import Image from "next/image";
import { deleteGear, toggleMain, updateGearImage, getGearReviews, getGearPrice } from "@/app/actions/gearActions";

interface GearCardProps {
  item: any;
  onUpdate: () => void;
  index: number;
}

export default function GearCard({ item, onUpdate, index }: GearCardProps) {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleCheckPrice = async () => {
    setIsCheckingPrice(true);
    await getGearPrice(item._id, item.name);
    setIsCheckingPrice(false);
    onUpdate();
  };

  return (
    <div
      className={`gear-card rounded-2xl overflow-hidden group relative flex flex-col transition-all duration-500 animate-fade-in-up stagger-${(index % 6) + 1} bg-gradient-to-b from-[#121212] to-[#080808] border ${
        item.isWishlist
          ? "border-purple-900/30 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          : item.isMain
          ? "border-green-900/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          : "border-[#1a1a1a] hover:border-[#333] hover:shadow-2xl"
      }`}
    >
      {/* Accent Top Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 z-10 opacity-50 group-hover:opacity-100 transition-opacity ${
        item.isWishlist ? "bg-gradient-to-r from-purple-600/0 via-purple-500 to-purple-600/0"
        : item.isMain ? "bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"
        : ""
      }`} />

      {/* IMAGE STAGE */}
      <div className="relative w-full h-48 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center p-6 border-b border-[#222]/50 overflow-hidden">
        {/* Subtle pedestal glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full blur-2xl z-0 transition-opacity duration-700 opacity-20 group-hover:opacity-60 ${
          item.isWishlist ? "bg-purple-500" : (item.isMain ? "bg-green-500" : "bg-white/10")
        }`} />
        
        {item.imageUrl ? (
          item.imageUrl.startsWith("ERROR_") ? (
            <div className="w-full h-full bg-red-950/20 flex p-4 items-center justify-center text-xs text-red-400 font-bold z-10 text-center break-words">{item.imageUrl}</div>
          ) : (
            <Image src={item.imageUrl} alt={item.name} width={400} height={400} className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} unoptimized />
          )
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-zinc-800">
            <span className="text-4xl mb-2 opacity-50">📷</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.category}</span>
          </div>
        )}
        
        {/* Image Edit Button */}
        <button
          onClick={() => { setIsEditingImage(true); setEditImageUrl(item.imageUrl || ""); }}
          className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs p-2 rounded-lg transition-all hover:bg-white hover:text-black font-bold"
          title="Change image URL"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
      </div>

      {/* Inline image URL editor */}
      {isEditingImage && (
        <div className="px-4 py-3 bg-[#0a0a0a] flex gap-2 border-b border-[#222] animate-fade-in z-20">
          <input autoFocus value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Paste image URL..."
            className="flex-1 bg-[#111] border border-[#333] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-green-500 transition placeholder:text-zinc-600" />
          <button
            onClick={async () => { await updateGearImage(item._id, editImageUrl); setIsEditingImage(false); setEditImageUrl(""); onUpdate(); }}
            className="bg-green-500 text-black text-[10px] uppercase font-black px-3 rounded-lg hover:bg-green-400 transition"
          >Save</button>
          <button onClick={() => { setIsEditingImage(false); setEditImageUrl(""); }}
            className="text-zinc-500 text-xs px-2 hover:text-white transition">✕</button>
        </div>
      )}

      {/* DETAILS CONTAINER */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] ${
            item.isWishlist
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              : item.isMain
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-white/5 text-zinc-400 border border-white/10"
          }`}>
            {item.category}
          </span>
          
          <div className="flex items-center gap-3">
            {item.isWishlist ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Wishlist</span>
              </div>
            ) : (
              item.isMain && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-green-400">Main</span>
                </div>
              )
            )}
            <button
              onClick={() => { deleteGear(item._id); onUpdate(); }}
              className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-500 transition-colors"
              title="Delete Gear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <h3 className="text-base font-black text-white mb-1.5 leading-snug tracking-tight group-hover:text-green-400 transition-colors duration-300">{item.name}</h3>

        {/* Price */}
        <div className="mb-4">
          {item.price ? (
            <a
              href={item.priceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black text-green-400/80 hover:text-green-300 transition-colors inline-flex items-center gap-1"
            >
              {item.price}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </a>
          ) : (
            <button
              onClick={handleCheckPrice}
              disabled={isCheckingPrice}
              className="text-[10px] font-bold text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-50 uppercase tracking-widest inline-flex items-center gap-1"
            >
              {isCheckingPrice ? "Checking..." : "Check Price"}
              {!isCheckingPrice && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            </button>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-2 border-t border-white/5">
          {!item.isWishlist && (
            <button
              onClick={async () => { await toggleMain(item._id, item.category); onUpdate(); }}
              className={`flex-1 text-[10px] font-black py-2.5 rounded-lg border transition-all uppercase tracking-widest ${
                item.isMain
                  ? "border-green-500/30 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  : "border-[#333] text-zinc-400 hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {item.isMain ? "★ Maining" : "Set Main"}
            </button>
          )}
          <button
            onClick={async () => {
              if (showReviews) { setShowReviews(false); return; }
              setShowReviews(true);
              setLoadingReviews(true);
              const res = await getGearReviews(item.name);
              setReviews(res);
              setLoadingReviews(false);
            }}
            className="px-4 text-[10px] font-black rounded-lg border border-[#333] text-zinc-400 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all uppercase tracking-widest"
          >Reviews</button>
        </div>
      </div>

      {/* REVIEWS DRAWER */}
      {showReviews && (
        <div className="px-5 pb-5 pt-0 animate-fade-in relative z-10 bg-[#0d0d0d]">
          <div className="border-t border-[#222] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Web Reviews</span>
            </div>
            {loadingReviews ? (
              <div className="text-xs text-zinc-500 animate-pulse font-medium">Fetching analysis...</div>
            ) : reviews?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reviews.map((r: any, i: number) => (
                  <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block group/review bg-[#111] p-3 rounded-xl border border-[#222] hover:border-blue-500/30 transition-colors">
                    <div className="text-[11px] font-black text-white group-hover/review:text-blue-400 transition-colors mb-1 line-clamp-1">{r.title}</div>
                    <div className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{r.snippet}</div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-2">No reviews found for this hardware.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
