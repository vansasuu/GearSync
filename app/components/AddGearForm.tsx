"use client";

import { useState } from "react";
import { addGear } from "@/app/actions/gearActions";

interface AddGearFormProps {
  onAdd: () => void;
}

export default function AddGearForm({ onAdd }: AddGearFormProps) {
  const [isWishlistAdd, setIsWishlistAdd] = useState(false);

  return (
    <div className="animate-fade-in-up stagger-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
        <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Add Gear</div>
      </div>
      <form
        action={async (formData) => {
          formData.set("isWishlist", isWishlistAdd ? "true" : "false");
          await addGear(formData);
          setIsWishlistAdd(false);
          onAdd();
        }}
        className="flex flex-col gap-3 relative"
      >
        <div className="relative group/input">
          <input
            name="name"
            placeholder="e.g. Razer DeathAdder V3 Pro"
            className="w-full bg-[#0a0a0a] border border-[#222] p-4 rounded-xl outline-none focus:border-green-500 focus:bg-black transition-all text-sm text-white placeholder:text-zinc-700 block"
            required
          />
        </div>
        
        <div className="relative">
          <select name="category" className="w-full appearance-none bg-[#0a0a0a] border border-[#222] p-4 rounded-xl outline-none focus:border-green-500 focus:bg-black transition-all text-sm text-zinc-300">
            <option value="Mouse">Mouse</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Headset">Headset</option>
            <option value="Mousepad">Mousepad</option>
            <option value="Monitor">Monitor</option>
            <option value="Audio">Audio</option>
            <option value="Controller">Controller</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 text-xs">▼</div>
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer group mt-1 mb-1">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" className="peer sr-only" checked={isWishlistAdd} onChange={() => setIsWishlistAdd(v => !v)} />
            <div className="w-5 h-5 rounded border border-[#333] bg-[#0a0a0a] peer-checked:border-purple-500 peer-checked:bg-purple-500/20 transition-all"></div>
            <div className="absolute text-purple-400 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none text-xs font-black">✓</div>
          </div>
          <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">Add to Wishlist instead</span>
        </label>

        <button
          type="submit"
          className={`group relative overflow-hidden font-black py-4 rounded-xl transition-all uppercase text-[11px] tracking-[0.2em] ${
            isWishlistAdd
              ? "bg-purple-600 text-white hover:bg-purple-500"
              : "bg-green-500 text-black hover:bg-green-400"
          }`}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span>{isWishlistAdd ? "Add to Wishlist" : "Add to Collection"}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
          {/* Button hover glow effect */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isWishlistAdd ? 'bg-gradient-to-r from-purple-400 to-purple-600 blur-xl' : 'bg-gradient-to-r from-green-400 to-green-300 blur-xl'}`}></div>
        </button>
      </form>
    </div>
  );
}
