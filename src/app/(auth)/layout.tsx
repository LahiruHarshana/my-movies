export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#c8c4bc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-xl p-8 border border-[#c8c4bc]/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8b3a2a] tracking-tight">🎬 My Movies</h1>
          <p className="text-sm text-[#c8c4bc]/50 mt-2">Your personal cinematic universe</p>
        </div>
        {children}
      </div>
    </div>
  );
}
