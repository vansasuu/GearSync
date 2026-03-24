"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { importProSetup } from "@/app/actions/gearActions";

export default function ImportProButton({ proId }: { proId: string }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(0);

  const handleImport = async () => {
    if (!session) { signIn("discord"); return; }
    setStatus("loading");
    try {
      const result = await importProSetup(proId);
      setCount(result.count);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  if (status === "done") {
    return (
      <span className="text-[10px] font-black text-green-500 uppercase tracking-wider">
        ✓ {count} added
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
        Failed
      </span>
    );
  }

  return (
    <button
      onClick={handleImport}
      disabled={status === "loading"}
      className="text-[10px] font-black text-zinc-600 hover:text-purple-400 transition uppercase tracking-wider disabled:opacity-50"
    >
      {status === "loading" ? "..." : "📥 Wishlist"}
    </button>
  );
}
