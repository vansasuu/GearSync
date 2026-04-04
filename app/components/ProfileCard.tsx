import React from "react";
import Image from "next/image";

interface ProfileCardProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  setupCount: number;
  mainingCount: number;
  wishlistCount: number;
}

export default function ProfileCard({
  user,
  setupCount,
  mainingCount,
  wishlistCount,
}: ProfileCardProps) {
  return (
    <div className="relative bg-[#0a0a0a] rounded-2xl p-6 flex flex-col items-center gap-5 border border-[#1a1a1a] overflow-hidden group hover:border-[#333] transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:bg-green-500/20" />
      
      <div className="relative z-10">
        <Image src={user.image || "/favicon.ico"} alt="avatar" width={64} height={64} className="w-16 h-16 rounded-2xl border border-[#333] shadow-2xl transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0a] animate-pulse"></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="font-black text-white text-xl tracking-tight">{user.name}</div>
        <div className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-widest font-semibold font-mono">
          gearsync.gg/u/{user.name}
        </div>
      </div>
      
      <div className="w-full bg-black/50 backdrop-blur-md rounded-xl px-4 py-4 flex justify-between items-center border border-white/5 relative z-10">
        <div className="text-center flex-1">
          <div className="text-xl font-black text-white drop-shadow-md">{setupCount}</div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Gear</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="text-center flex-1">
          <div className="text-xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{mainingCount}</div>
          <div className="text-[9px] opacity-80 text-green-500/70 font-bold uppercase tracking-[0.2em] mt-0.5">Maining</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="text-center flex-1">
          <div className="text-xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]">{wishlistCount}</div>
          <div className="text-[9px] opacity-80 text-purple-400/70 font-bold uppercase tracking-[0.2em] mt-0.5">Wishlist</div>
        </div>
      </div>
    </div>
  );
}
