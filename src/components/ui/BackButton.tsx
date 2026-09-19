"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-[#c8c4bc]/50 hover:text-[#8b3a2a] transition-colors cursor-pointer">
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}
