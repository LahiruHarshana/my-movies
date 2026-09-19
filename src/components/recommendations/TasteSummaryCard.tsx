import { BarChart3, Sparkles } from "lucide-react";
import type { TasteSummary } from "@/lib/recommendations/types";

export default function TasteSummaryCard({ summary }: { summary: TasteSummary }) {
  return (
    <div className="rounded-2xl border border-[#c8c4bc]/10 bg-[#c8c4bc]/[0.03] p-6 mb-10">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#8b3a2a]/20">
          <BarChart3 className="w-5 h-5 text-[#8b3a2a]" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#c8c4bc] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8b3a2a]" />
            Your Movie Profile
          </h2>
          <p className="text-sm text-[#c8c4bc]/50 mt-1">{summary.confidenceMessage}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#c8c4bc]/40">Watched</p>
              <p className="text-2xl font-light text-[#c8c4bc] mt-1">{summary.totalWatched}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#c8c4bc]/40">Avg Rating</p>
              <p className="text-2xl font-light text-[#c8c4bc] mt-1">{summary.avgRating}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#c8c4bc]/40">Top Genres</p>
              <p className="text-sm text-[#c8c4bc]/80 mt-2">
                {summary.topGenres.length > 0 ? summary.topGenres.join(", ") : "Not enough data yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
