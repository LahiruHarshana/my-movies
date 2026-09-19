"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RecommendationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Recommendations page error:", error);
  }, [error]);

  return (
    <div className="text-center mt-20 max-w-lg mx-auto">
      <AlertTriangle className="w-12 h-12 text-[#8b3a2a] mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-[#c8c4bc] mb-2">Could Not Load Recommendations</h2>
      <p className="text-[#c8c4bc]/50 mb-6">
        We had trouble fetching movie data. This is usually temporary — try refreshing.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-[#8b3a2a] hover:bg-[#8b3a2a]/90 text-[#c8c4bc] px-6 py-2.5 rounded-xl font-medium transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
