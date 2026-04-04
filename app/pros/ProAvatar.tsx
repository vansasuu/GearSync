"use client";
import { useState } from "react";
import Image from "next/image";

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function ProAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs font-black text-green-500">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={100}
      height={100}
      className="w-full h-full object-cover object-top"
      onError={() => setImgError(true)}
      unoptimized
    />
  );
}
